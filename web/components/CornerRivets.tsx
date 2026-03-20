/**
 * Decorative corner rivets used on card/panel components.
 * Four small circles positioned in each corner of a relative-positioned parent.
 */
export default function CornerRivets() {
  return (
    <>
      <div
        className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50"
        aria-hidden="true"
      />
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50"
        aria-hidden="true"
      />
    </>
  )
}
