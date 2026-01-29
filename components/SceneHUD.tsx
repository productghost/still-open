'use client'

type Phase = 'PRE_ARRIVAL' | 'ARRIVED'

type SceneHUDProps = {
  phase: Phase
  onArrive: () => void
  onGoToAnchor: (anchorId: string) => void
}

/**
 * Simple HUD component for testing camera navigation.
 * 
 * In PRE_ARRIVAL: shows "Arrive" button
 * In ARRIVED: shows test buttons for each anchor
 */
export default function SceneHUD({ phase, onArrive, onGoToAnchor }: SceneHUDProps) {
  const anchors = [
    { id: 'CAM_DEFAULT', label: 'Default' },
    { id: 'CAM_ABOUT', label: 'About' },
    { id: 'CAM_PROJECTS', label: 'Projects' },
    { id: 'CAM_EXPERIMENTS', label: 'Experiments' },
    { id: 'CAM_NOTES', label: 'Notes' },
    { id: 'CAM_CONTACT', label: 'Contact' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {phase === 'PRE_ARRIVAL' && (
        <div
          style={{
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={onArrive}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ARRIVE
          </button>
        </div>
      )}

      {phase === 'ARRIVED' && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          {anchors.map((anchor) => (
            <button
              key={anchor.id}
              onClick={() => onGoToAnchor(anchor.id)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {anchor.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
