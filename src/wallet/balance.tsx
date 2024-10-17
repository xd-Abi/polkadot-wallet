interface Props {
  address: string;
  balance: number;
}

export function BalanceCard(props: Props) {
  const {address, balance} = props;

  return (
    <div
      className="w-full h-64 mt-8 rounded-xl px-5 py-7 flex flex-col bg-cover bg-no-repeat transition-all duration-200 ease-in hover:scale-[101%]"
      style={{backgroundImage: "url('/card.png')"}}
    >
      <div className="w-full flex items-start justify-between">
        <div className="font-medium font-bebas-neue text-[2.5rem] leading-[2.2rem]">
          Westend
        </div>
        <div className="text-white text-opacity-80 text-sm">CRYPTO</div>
      </div>
      <div className="h-full w-full flex items-end justify-between">
        <div className="flex flex-col items-start">
          <div className="text-white text-opacity-70 text-sm font-medium">
            {address.substring(0, 6)}...{address.substring(42)}
          </div>
          <div className="flex text-2xl font-medium items-center">
            {balance / Math.pow(10, 12)}
            <span className="text-white text-opacity-50 text-base ml-1">
              WND
            </span>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          id="Logo"
          x="0px"
          y="0px"
          viewBox="0 0 1326.1 1410.3"
          className="size-14"
          fill="white"
        >
          <ellipse className="st0" cx="663" cy="147.9" rx="254.3" ry="147.9" />
          <ellipse className="st0" cx="663" cy="1262.3" rx="254.3" ry="147.9" />
          <ellipse
            transform="matrix(0.5 -0.866 0.866 0.5 -279.1512 369.5916)"
            className="st0"
            cx="180.5"
            cy="426.5"
            rx="254.3"
            ry="148"
          />
          <ellipse
            transform="matrix(0.5 -0.866 0.866 0.5 -279.1552 1483.9517)"
            className="st0"
            cx="1145.6"
            cy="983.7"
            rx="254.3"
            ry="147.9"
          />
          <ellipse
            transform="matrix(0.866 -0.5 0.5 0.866 -467.6798 222.044)"
            className="st0"
            cx="180.5"
            cy="983.7"
            rx="148"
            ry="254.3"
          />
          <ellipse
            transform="matrix(0.866 -0.5 0.5 0.866 -59.8007 629.9254)"
            className="st0"
            cx="1145.6"
            cy="426.6"
            rx="147.9"
            ry="254.3"
          />
        </svg>
      </div>
    </div>
  );
}
