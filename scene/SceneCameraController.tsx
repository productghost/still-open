'use client'

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { anchors as anchorsData } from './anchors/anchors'

type Phase = 'PRE_ARRIVAL' | 'ARRIVED'

type Anchor = {
  id: string
  position: [number, number, number]
  target: [number, number, number]
  yawBounds: [number, number]
  heightBounds: [number, number]
}

export type CameraControllerRef = {
  goToAnchor: (id: string) => void
}

type CameraControllerProps = {
  phase: Phase
  onPhaseChange?: (phase: Phase) => void
  children: React.ReactNode
}

/**
 * SceneCameraController manages camera behavior according to the camera navigation spec.
 * 
 * Features:
 * - Phase management (PRE_ARRIVAL locks camera, ARRIVED enables interaction)
 * - Smooth transitions between anchor frames
 * - Bounded drag input (yaw and height adjustment)
 * - Mobile pinch zoom (narrow range)
 * - All camera frames loaded from anchors.json
 */
const SceneCameraController = forwardRef<CameraControllerRef, CameraControllerProps>(({
  phase,
  onPhaseChange,
  children,
}, ref) => {
  const { camera } = useThree()
  const anchors = anchorsData as Anchor[]
  
  // Find default anchor
  const defaultAnchor = anchors.find(a => a.id === 'CAM_DEFAULT') || anchors[0]
  
  // Current anchor state
  const [currentAnchorId, setCurrentAnchorId] = useState<string>(defaultAnchor.id)
  const activeAnchorIdRef = useRef<string>(defaultAnchor.id) // Ref to avoid state update race conditions
  const currentAnchor = anchors.find(a => a.id === currentAnchorId) || defaultAnchor
  
  // Focus state: 'default' allows spinning, focused states (about, projects, etc.) lock camera
  const currentFocus = currentAnchorId === 'CAM_DEFAULT' ? 'default' : currentAnchorId
  const isSpinEnabled = phase === 'ARRIVED' && currentFocus === 'default'
  
  // Camera state
  const targetPosition = useRef(new Vector3(...currentAnchor.position))
  const targetLookAt = useRef(new Vector3(...currentAnchor.target))
  const startPosition = useRef(new Vector3(...currentAnchor.position))
  const startLookAt = useRef(new Vector3(...currentAnchor.target))
  const isTransitioning = useRef(false)
  const transitionStartTime = useRef(0)
  const transitionDuration = useRef(1000) // 1000ms default
  
  // Drag state
  const isDragging = useRef(false)
  const lastDragPosition = useRef({ x: 0, y: 0 })
  const lastDragTime = useRef(0)
  
  // Orbit state (spherical coordinates)
  const yaw = useRef(0) // Horizontal rotation around target
  const pitch = useRef(0) // Vertical angle (pitch)
  const yawVelocity = useRef(0) // Angular velocity in radians per second (for inertia)
  
  // Fixed radius and target for spinning (locked to prevent zoom/vertical drift)
  const fixedRadius = useRef(5) // Fixed distance from target (calculated from anchor)
  const fixedTarget = useRef(new Vector3(0, 0, 0)) // Fixed center point (from anchor target)
  
  // Calculate initial yaw/pitch from default anchor and store fixed radius/target
  useEffect(() => {
    const anchor = defaultAnchor
    const anchorPos = new Vector3(...anchor.position)
    const anchorTarget = new Vector3(...anchor.target)
    const direction = new Vector3().subVectors(anchorPos, anchorTarget)
    const radius = direction.length()
    const initialYaw = Math.atan2(direction.x, direction.z)
    const initialPitch = Math.asin(direction.y / radius)
    yaw.current = initialYaw
    pitch.current = initialPitch
    // Store fixed radius and target for spinning (locked to prevent zoom/vertical drift)
    fixedRadius.current = radius
    fixedTarget.current.copy(anchorTarget)
  }, [defaultAnchor])
  
  // Mobile pinch zoom state
  const lastPinchDistance = useRef(0)
  const baseDistance = useRef(5)
  const minDistance = useRef(3)
  const maxDistance = useRef(7)
  
  // Initialize camera to default anchor
  useEffect(() => {
    if (phase === 'PRE_ARRIVAL') {
      const anchor = defaultAnchor
      targetPosition.current.set(...anchor.position)
      targetLookAt.current.set(...anchor.target)
      camera.position.copy(targetPosition.current)
      camera.lookAt(targetLookAt.current)
      // Initialize yaw/pitch from default anchor
      const anchorPos = new Vector3(...defaultAnchor.position)
      const anchorTarget = new Vector3(...defaultAnchor.target)
      const direction = new Vector3().subVectors(anchorPos, anchorTarget)
      const radius = direction.length()
      yaw.current = Math.atan2(direction.x, direction.z)
      pitch.current = Math.asin(direction.y / radius)
      activeAnchorIdRef.current = defaultAnchor.id
    }
  }, [phase, defaultAnchor, camera])
  
  // Smooth camera transitions
  useFrame((state, delta) => {
    // PRIORITY 1: Handle transitions (highest priority, exclusive control)
    // ONLY update camera during transitions - no other code path touches camera
    if (isTransitioning.current) {
      const elapsed = Date.now() - transitionStartTime.current
      const progress = Math.min(elapsed / transitionDuration.current, 1)
      
      // Ease function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      // Direct interpolation from captured start to target
      camera.position.lerpVectors(startPosition.current, targetPosition.current, eased)
      
      // Interpolate look-at point
      const currentLookAt = new Vector3().lerpVectors(startLookAt.current, targetLookAt.current, eased)
      camera.lookAt(currentLookAt)
      
      if (progress >= 1) {
        isTransitioning.current = false
        // Snap to exact target to avoid drift
        camera.position.copy(targetPosition.current)
        camera.lookAt(targetLookAt.current)
      }
      return // Exit early - transition has exclusive control
    }
    
    // PRIORITY 2: PRE_ARRIVAL phase (lock to default)
    // Only update if camera is not already at target (one-time setup)
    if (phase !== 'ARRIVED') {
      if (camera.position.distanceTo(targetPosition.current) > 0.01) {
        camera.position.lerp(targetPosition.current, 0.1)
        camera.lookAt(targetLookAt.current)
      }
      return
    }
    
    // PRIORITY 3: ARRIVED phase - apply orbit controls with inertia (only when NOT transitioning)
    // Use ref to track active anchor to avoid state update race conditions during transitions
    const anchor = anchors.find(a => a.id === activeAnchorIdRef.current) || defaultAnchor
    const target = new Vector3(...anchor.target)
    
    // Determine current focus for this frame
    const frameFocus = activeAnchorIdRef.current === 'CAM_DEFAULT' ? 'default' : activeAnchorIdRef.current
    const frameIsSpinEnabled = phase === 'ARRIVED' && frameFocus === 'default'
    
    // Apply inertia when not dragging (spinner effect) - only in default focus
    if (frameIsSpinEnabled && !isDragging.current && Math.abs(yawVelocity.current) > MIN_VELOCITY) {
      // Use actual frame delta time from useFrame (in seconds)
      const frameDelta = delta || 0.016 // Fallback to ~60fps if delta not available
      
      // Apply velocity to yaw (unbounded - allow full 360° spinning)
      yaw.current += yawVelocity.current * frameDelta
      
      // Apply damping (exponential decay) - tuned for 1-2 rotations max
      yawVelocity.current *= Math.exp(-DAMPING * frameDelta)
      
      // Stop when velocity is very small
      if (Math.abs(yawVelocity.current) < MIN_VELOCITY) {
        yawVelocity.current = 0
      }
      
      // Yaw is unbounded - no horizontal clamp (removed yaw bounds for spinner behavior)
    }
    
    // Hard-lock camera distance and vertical offset
    // Use constant radius and target from anchor - do not modify these values
    const useFixedValues = frameFocus === 'default'
    const radius = useFixedValues 
      ? fixedRadius.current // Fixed radius for spinning (cube size stays constant)
      : (() => {
          const basePos = new Vector3(...anchor.position)
          const baseRadius = basePos.distanceTo(target)
          return baseRadius + (baseDistance.current - 5) // Allow zoom in focused states
        })()
    
    // Use fixed target (clone to avoid modifying original)
    // Fixed target.y ensures no vertical drift during horizontal spin
    const centerTarget = useFixedValues 
      ? fixedTarget.current.clone() // Fixed target for spinning (vertical position stays constant)
      : target.clone() // Clone to avoid modifying original
    
    // Convert yaw/pitch to camera position using spherical coordinates
    // Hard-lock: radius and target.y are constant, only yaw/pitch change
    const x = centerTarget.x + radius * Math.cos(pitch.current) * Math.sin(yaw.current)
    const y = centerTarget.y + radius * Math.sin(pitch.current)
    const z = centerTarget.z + radius * Math.cos(pitch.current) * Math.cos(yaw.current)
    
    // Set camera position directly (no lerp to prevent drift)
    // This ensures cube size and vertical position stay constant while spinning
    camera.position.set(x, y, z)
    camera.lookAt(centerTarget)
  })
  
  // Transition to anchor
  const goToAnchor = useCallback((anchorId: string) => {
    if (phase !== 'ARRIVED') return
    
    const anchor = anchors.find(a => a.id === anchorId)
    if (!anchor) return
    
    // If already transitioning to the same anchor, ignore
    if (isTransitioning.current && activeAnchorIdRef.current === anchorId) return
    
    // Cancel any existing transition by immediately capturing current camera state
    // This must happen synchronously before any state updates
    startPosition.current.copy(camera.position)
    
    // Calculate current look-at point accurately
    const currentLookDir = new Vector3()
    camera.getWorldDirection(currentLookDir)
    startLookAt.current.copy(camera.position).add(currentLookDir.multiplyScalar(10))
    
    // Set target anchor position and look-at (use anchor's own target, not cube center)
    targetPosition.current.set(...anchor.position)
    targetLookAt.current.set(...anchor.target)
    
    // Log transition details for debugging
    console.log('Transition:', {
      from: currentAnchorId,
      to: anchorId,
      startPos: [startPosition.current.x, startPosition.current.y, startPosition.current.z],
      startTarget: [startLookAt.current.x, startLookAt.current.y, startLookAt.current.z],
      endPos: anchor.position,
      endTarget: anchor.target,
    })
    
    // IMMEDIATELY start transition (before any state updates or re-renders)
    // This flag ensures the next useFrame will use transition logic exclusively
    isTransitioning.current = true
    transitionStartTime.current = Date.now()
    transitionDuration.current = 1000
    
    // Stop any inertia when transitioning
    yawVelocity.current = 0
    
    // Update ref immediately (synchronous, no re-render)
    activeAnchorIdRef.current = anchorId
    
    // Stop any motion when focus changes away from default
    const newFocus = anchorId === 'CAM_DEFAULT' ? 'default' : anchorId
    if (newFocus !== 'default') {
      yawVelocity.current = 0
      isDragging.current = false
    }
    
    // Update state AFTER transition is started (these won't affect current frame)
    // Initialize yaw/pitch from new anchor position
    const anchorPos = new Vector3(...anchor.position)
    const anchorTarget = new Vector3(...anchor.target)
    const direction = new Vector3().subVectors(anchorPos, anchorTarget)
    const radius = direction.length()
    yaw.current = Math.atan2(direction.x, direction.z)
    pitch.current = Math.asin(direction.y / radius)
    baseDistance.current = 5
    
    // Update fixed radius and target if transitioning to default anchor
    if (anchorId === 'CAM_DEFAULT') {
      fixedRadius.current = radius
      fixedTarget.current.copy(anchorTarget)
    }
    
    // Update anchor ID state (for UI/display purposes, but ref is used for camera logic)
    setCurrentAnchorId(anchorId)
  }, [phase, anchors, camera, currentAnchorId])
  
  // View adjustment sensitivity constants
  // Tuned for spinner: 1-1.5 full rotations max from a strong flick
  const DRAG_SENSITIVITY = 0.025 // yaw sensitivity (horizontal rotation) - smaller for controlled spin
  const PITCH_SENSITIVITY = 0.01 // pitch sensitivity (vertical rotation - no inertia)
  
  // Inertia constants
  const DAMPING = 3.5 // Damping factor for velocity decay (stronger damping for controlled stop)
  const MIN_VELOCITY = 0.001 // Stop when velocity is below this threshold (radians per second)
  
  // Pitch constraints (in radians) - prevent looking under the cube
  const MIN_PITCH = 0.1 // Just above horizon (can look down slightly, but never under cube)
  const MAX_PITCH = Math.PI / 2 // Straight up (can look up)
  
  // View adjustment handlers (Section 7: Continuous Input)
  // Desktop: left mouse button drag only
  // Touch: single-finger drag only
  // Two-finger pinch for mobile zoom (narrow range)
  
  const handlePointerDown = useCallback((e: any) => {
    // Spinning only allowed in default focus
    if (!isSpinEnabled || isTransitioning.current) return
    
    // Desktop: only left mouse button (button 0)
    // Touch: pointerType will be 'touch', which is allowed
    if (e.button !== 0 && e.button !== undefined && e.pointerType === 'mouse') return
    
    // Ignore if already handling pinch zoom
    if (lastPinchDistance.current > 0) return
    
    isDragging.current = true
    // Fully cancel existing inertia - every new drag starts fresh
    yawVelocity.current = 0
    // Store initial position and time for velocity calculation
    lastDragPosition.current = { x: e.clientX, y: e.clientY }
    lastDragTime.current = performance.now()
    
    // Safely call preventDefault if available
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
  }, [isSpinEnabled])
  
  const handlePointerMove = useCallback((e: any) => {
    // Spinning only allowed in default focus
    if (!isDragging.current || !isSpinEnabled || isTransitioning.current) return
    
    // Safely access event properties
    if (!e || typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return
    
    // Calculate incremental delta from previous position
    const dx = e.clientX - lastDragPosition.current.x
    const dy = e.clientY - lastDragPosition.current.y
    
    // Update stored position immediately for next calculation
    lastDragPosition.current = { x: e.clientX, y: e.clientY }
    
    // Calculate time delta for velocity (distance / time)
    const now = performance.now()
    const dt = (now - lastDragTime.current) / 1000 // Convert to seconds
    lastDragTime.current = now
    
    // Filter out tiny jitters (no dead-zone for real movement)
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      return
    }
    
    // Axis dominance: horizontal-dominant gesture → spin, vertical-dominant → tilt only
    // This guarantees: no spinning at all when dragging mostly up/down
    
    // Horizontal-dominant gesture → spin
    if (Math.abs(dx) > Math.abs(dy)) {
      // Drag right (positive dx) = cube spins right (decrease yaw for correct visual direction)
      yaw.current -= dx * DRAG_SENSITIVITY
      
      // Calculate instantaneous velocity from distance / time
      // Faster flick (shorter dt) produces higher velocity = more spin
      const minDt = 1 / 120 // Cap at 120fps to prevent huge velocities from tiny dt
      const instantaneousVelocity = (-dx * DRAG_SENSITIVITY) / Math.max(dt, minDt)
      yawVelocity.current = instantaneousVelocity
    }
    
    // Vertical-dominant gesture → tilt only (no spinning)
    if (Math.abs(dy) > Math.abs(dx)) {
      // Drag down (positive dy) = look down (increase pitch)
      pitch.current += dy * PITCH_SENSITIVITY
      // Clamp pitch to dome (prevent looking under cube, allow looking up)
      pitch.current = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch.current))
    }
    
    // Yaw is unbounded - allow full 360° spinning (no horizontal clamp)
  }, [isSpinEnabled])
  
  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    // Keep yawVelocity for inertia - it will decay in useFrame
  }, [])
  
  const handlePointerCancel = useCallback(() => {
    isDragging.current = false
    lastPinchDistance.current = 0
  }, [])
  
  // Mobile pinch zoom handler (Section 8: narrow range only)
  // Two-finger pinch changes distance within strict limits
  const handleTouchStart = useCallback((e: any) => {
    if (phase !== 'ARRIVED' || isTransitioning.current) return
    
    // Safely access touches array
    if (!e || !e.touches || !Array.isArray(e.touches)) return
    
    // Two-finger pinch for zoom
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastPinchDistance.current = distance
      // Cancel any active drag when pinch starts
      isDragging.current = false
    } else {
      // Single finger - reset pinch state
      lastPinchDistance.current = 0
    }
  }, [phase])
  
  const handleTouchMove = useCallback((e: any) => {
    if (phase !== 'ARRIVED' || isTransitioning.current) return
    
    // Safely access touches array
    if (!e || !e.touches || !Array.isArray(e.touches)) return
    
    // Two-finger pinch zoom
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (lastPinchDistance.current > 0) {
        // Pinch zoom: narrow range only (close enough to read, far enough to feel outside)
        const delta = (distance - lastPinchDistance.current) * 0.01
        baseDistance.current = Math.max(
          minDistance.current, // Minimum: close enough to read content
          Math.min(maxDistance.current, baseDistance.current - delta) // Maximum: still feels outside on sidewalk
        )
      }
      
      lastPinchDistance.current = distance
      
      // Safely call preventDefault if available
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault()
      }
    } else if (e.touches.length === 1) {
      // Single finger - reset pinch state, allow drag
      lastPinchDistance.current = 0
    }
  }, [phase])
  
  // Prevent wheel/trackpad zoom (Section 8: Forbidden)
  const handleWheel = useCallback((e: any) => {
    if (phase !== 'ARRIVED') return
    // Explicitly prevent all wheel-based zoom/dolly
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
  }, [phase])
  
  // Expose goToAnchor via ref
  useImperativeHandle(ref, () => ({
    goToAnchor,
  }), [goToAnchor])
  
  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
    >
      {children}
    </group>
  )
})

SceneCameraController.displayName = 'SceneCameraController'

export default SceneCameraController
