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
          <div className="text-gray2 mt-5 text-sm">{props.caption}</div>
        </div>
      )}
      {!props.loading && props.children}
    </>
  );
}
