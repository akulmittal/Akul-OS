import bird from '/assets/attachments/image.png'

/* AKUL OS identity: Akul's own phoenix artwork, shown as a small mark */
export default function Logo({ size = 18 }: { size?: number }) {
  return (
    <img src={bird} alt="AKUL OS" width={size} height={size}
      style={{ width: size, height: size, objectFit: 'cover', objectPosition: '55% 38%', borderRadius: size * 0.28, display: 'block', background: '#000', boxShadow: '0 0 0 1px #ffffff14' }} />
  )
}
