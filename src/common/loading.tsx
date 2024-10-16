interface Props {
  children: React.ReactNode;
  loading: boolean;
  caption: string;
}

export function Loading(props: Props) {
  return (
    <>
      {props.loading && (
        <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center">
          <span className="loader"></span>
          <div className="text-gray2 mt-5 text-sm flex">
            {props.caption}
            <div className="animate-pending-dots [animation-delay:-0.3s]">
              .
            </div>
            <div className="animate-pending-dots [animation-delay:-0.15s]">
              .
            </div>
            <div className="animate-pending-dots">.</div>
          </div>
        </div>
      )}
      {!props.loading && props.children}
    </>
  );
}
