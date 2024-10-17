import {useForm} from "react-hook-form";

interface Props {
  onBack: () => void;
  transfer: (recipient: string, amount: number) => Promise<void>;
}

interface TransferInterface {
  amount: string;
  recipient: string;
}

export function Transfer(props: Props) {
  const {onBack, transfer} = props;
  const {register, handleSubmit} = useForm<TransferInterface>();

  const onSubmit = (data: TransferInterface) => {
    transfer(data.recipient, +data.amount);
  };

  return (
    <div className="w-full">
      <div
        className="w-fit text-base font-bold flex items-center text-blue-500 gap-2 transition-all duration-200 ease-in hover:text-blue-600 cursor-pointer"
        onClick={onBack}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
        >
          <path
            opacity="0.4"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.875 12C8.875 12.5523 9.32272 13 9.875 13L19.875 13C20.4273 13 20.875 12.5523 20.875 12C20.875 11.4477 20.4273 11 19.875 11L9.875 11C9.32272 11 8.875 11.4477 8.875 12Z"
            fill="currentColor"
          ></path>
          <path
            d="M3.68621 13.2272C3.39329 12.9205 3.125 12.5259 3.125 12.0012C3.125 11.4765 3.39329 11.0838 3.68621 10.7772C3.95899 10.4916 4.38826 10.1535 4.82504 9.80952L5.83884 9.01087C6.58134 8.42591 7.20286 7.93625 7.72013 7.63613C8.24039 7.33426 8.88006 7.089 9.54328 7.38265C10.2246 7.68431 10.4467 8.33642 10.5369 8.92321C10.6251 9.49729 10.6251 10.2671 10.625 11.1757L10.625 12.8287C10.6251 13.7373 10.6251 14.5071 10.5369 15.0812C10.4467 15.668 10.2246 16.3201 9.54328 16.6217C8.88006 16.9154 8.24039 16.6701 7.72013 16.3683C7.20286 16.0681 6.58132 15.5785 5.83881 14.9935L4.82504 14.1949C4.38826 13.8509 3.95899 13.5128 3.68621 13.2272Z"
            fill="currentColor"
          ></path>
        </svg>
        Go Back
      </div>
      <div className="text-5xl font-bold mt-3">Transfer</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex items-center mt-8 gap-2 text-xl">
          <div className="text-gray1 font-medium whitespace-nowrap">
            Your sending
          </div>
          <div className="w-full flex items-end">
            <input
              className="w-full bg-transparent pl-2 pr-1 text-right outline-none placeholder:text-gray1 text-blue-500"
              placeholder="1"
              {...register("amount")}
            />
            <div className="text-sm text-gray2 mb-1">WND</div>
          </div>
        </div>
        <div className="w-full flex items-center mt-5 gap-2 text-xl">
          <div className="text-gray1 font-medium whitespace-nowrap">To</div>
          <div className="w-full flex items-end">
            <input
              className="w-full bg-transparent pl-2 pr-1 text-right outline-none placeholder:text-gray1 text-blue-500"
              placeholder="5FCcQj...m498is"
              {...register("recipient")}
            />
            <div className="text-sm text-gray2 mb-1">ADDR</div>
          </div>
        </div>
        <div className="mt-20 w-full flex justify-center">
          <button className="text-xl px-5 py-2 bg-blue-500 rounded-xl flex items-center gap-2 transition-all duration-200 ease-in hover:bg-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5 text-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 22.875C11.4477 22.875 11 22.4273 11 21.875L11 17.875C11 17.3227 11.4477 16.875 12 16.875C12.5523 16.875 13 17.3227 13 17.875L13 21.875C13 22.4273 12.5523 22.875 12 22.875ZM16 20.875C15.4477 20.875 15 20.4273 15 19.875L15 17.875C15 17.3227 15.4477 16.875 16 16.875C16.5523 16.875 17 17.3227 17 17.875L17 19.875C17 20.4273 16.5523 20.875 16 20.875ZM8 20.875C7.44771 20.875 7 20.4273 7 19.875L7 17.875C7 17.3227 7.44772 16.875 8 16.875C8.55228 16.875 9 17.3227 9 17.875L9 19.875C9 20.4273 8.55228 20.875 8 20.875Z"
                fill="currentColor"
              ></path>
              <path
                opacity="0.4"
                d="M18.5 17.8754C18.5 17.8768 18.5 17.8732 18.5 17.8744C18.5014 18.054 18.6711 18.1971 18.8484 18.1681C18.8495 18.1679 18.8368 18.1701 18.8419 18.1692C19.8508 17.9964 20.6828 17.6659 21.3545 17.0048C22.105 16.2662 22.4385 15.3283 22.5967 14.1709C22.75 13.048 22.75 11.614 22.75 9.80654L22.75 9.69226C22.75 7.88482 22.75 6.45076 22.5967 5.32792C22.4385 4.17045 22.105 3.23261 21.3545 2.49397C20.6057 1.75696 19.6578 1.43086 18.4875 1.27599C17.349 1.12534 15.8941 1.12536 14.0557 1.12537L9.94433 1.12537C8.10592 1.12536 6.65096 1.12534 5.51253 1.27599C4.34225 1.43086 3.39427 1.75696 2.64547 2.49397C1.89501 3.23261 1.56146 4.17045 1.40335 5.32791C1.24997 6.45075 1.24998 7.88479 1.25 9.69223L1.25 9.80656C1.24998 11.614 1.24997 13.048 1.40335 14.1709C1.56146 15.3283 1.89501 16.2662 2.64547 17.0048C3.31717 17.6659 4.14915 17.9964 5.15809 18.1692C5.16316 18.1701 5.15049 18.1679 5.15162 18.1681C5.32892 18.1971 5.49861 18.054 5.49999 17.8744C5.5 17.8732 5.5 17.8768 5.5 17.8754C5.5 16.4947 6.61929 15.3754 8 15.3754C8.5308 15.3754 9.02296 15.5408 9.42774 15.8229C9.74643 16.045 9.90577 16.156 10 16.156C10.0942 16.156 10.2536 16.045 10.5723 15.8229C10.977 15.5408 11.4692 15.3754 12 15.3754C12.5308 15.3754 13.023 15.5408 13.4277 15.8229C13.7464 16.045 13.9058 16.156 14 16.156C14.0942 16.156 14.2536 16.045 14.5723 15.8229C14.977 15.5408 15.4692 15.3754 16 15.3754C17.3807 15.3754 18.5 16.4947 18.5 17.8754Z"
                fill="currentColor"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.5 9.75C4.5 10.3023 4.94772 10.75 5.5 10.75L5.50898 10.75C6.06127 10.75 6.50898 10.3023 6.50898 9.75C6.50898 9.19772 6.06127 8.75 5.50898 8.75L5.5 8.75C4.94772 8.75 4.5 9.19772 4.5 9.75Z"
                fill="currentColor"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4902 9.75C17.4902 10.3023 17.9379 10.75 18.4902 10.75L18.4992 10.75C19.0515 10.75 19.4992 10.3023 19.4992 9.75C19.4992 9.19772 19.0515 8.75 18.4992 8.75L18.4902 8.75C17.9379 8.75 17.4902 9.19772 17.4902 9.75Z"
                fill="currentColor"
              ></path>
              <path
                d="M15.25 9.75C15.25 11.5449 13.7949 13 12 13C10.2051 13 8.75 11.5449 8.75 9.75C8.75 7.95507 10.2051 6.5 12 6.5C13.7949 6.5 15.25 7.95507 15.25 9.75Z"
                fill="currentColor"
              ></path>
            </svg>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
