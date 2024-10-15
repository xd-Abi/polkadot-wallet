import { useEffect, useState } from "react";
import { ScProvider } from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";
import { WellKnownChain } from "@substrate/connect";
import { ApiPromise, Keyring } from "@polkadot/api";
import {
  cryptoWaitReady,
  decodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";

export function Wallet() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [address, setAddress] = useState<string>("");
  const [keyPair, setKeyPair] = useState<any>(null);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [mnemonic, setMnemonic] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    const initWallet = async () => {
      const provider = new ScProvider(Sc, WellKnownChain.westend2);
      await provider.connect();
      const api = await ApiPromise.create({ provider });
      setApi(api);

      await cryptoWaitReady();
      let walletMnemonic = localStorage.getItem("polkadot_mnemonic");

      if (!walletMnemonic) {
        const generatedMnemonic = mnemonicGenerate();

        const isValid = mnemonicValidate(generatedMnemonic);
        if (!isValid) {
          console.error("Invalid mnemonic generated.");
          return;
        }

        localStorage.setItem("polkadot_mnemonic", generatedMnemonic);
        walletMnemonic = generatedMnemonic;
      }

      const keyring = new Keyring({ type: "sr25519" });
      const miniSecret = mnemonicToMiniSecret(walletMnemonic);
      const pair = keyring.addFromSeed(miniSecret);

      setMnemonic(walletMnemonic);
      setKeyPair(pair);
      setAddress(pair.address);

      const data = await api.query.system.account(pair.address);
      const {
        data: { free },
      } = JSON.parse(data.toString());
      setBalance(free);
    };

    initWallet().catch(console.error);
  }, []);

  const transfer = async () => {
    if (!keyPair || !recipient || !amount || !api) {
      console.error("Missing required details to send funds.");
      return;
    }

    if (!api.isReady) {
      console.error("API is not ready.");
      return;
    }

    try {
      const to = decodeAddress(recipient);
      const transfer = api.tx.balances.transferAllowDeath(to, BigInt(amount));
      const unsub = await transfer.signAndSend(
        keyPair,
        ({ status, events }: any) => {
          if (status.isInBlock) {
            console.log(
              "Transaction included at blockHash",
              status.asInBlock.toHex()
            );
          } else if (status.isFinalized) {
            console.log(
              "Transaction finalized at blockHash",
              status.asFinalized.toHex()
            );
          }

          events.forEach(({ event: { method, section }, phase }: any) => {
            console.log("Event:", phase.toString(), `: ${section}.${method}`);
          });
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 font-roboto">
      <div className="max-w-lg mx-auto mt-20">
        <div className="text-5xl font-bold">Wallet</div>
        <div
          className="w-full h-64 mt-8 rounded-xl px-5 py-7 flex flex-col bg-cover bg-no-repeat transition-all duration-200 ease-in hover:scale-[101%]"
          style={{ backgroundImage: "url('/card.png')" }}
        >
          <div className="w-full flex items-start justify-between">
            <div className="font-medium font-bebas-neue text-[2.5rem] leading-[2.2rem]">
              Westend
            </div>
            <div className="text-white text-opacity-80 text-sm">CRYPTO</div>
          </div>
          <div className="h-full w-full flex items-end justify-between">
            <div className="text-white text-xl font-medium">
              {address.substring(0, 6)} ... {address.substring(42)}
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
              <ellipse
                className="st0"
                cx="663"
                cy="147.9"
                rx="254.3"
                ry="147.9"
              />
              <ellipse
                className="st0"
                cx="663"
                cy="1262.3"
                rx="254.3"
                ry="147.9"
              />
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
        <div className="w-full grid grid-cols-4 mt-10">
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-col gap-2 group items-center justify-center">
              <div className="size-[4.25rem] bg-gray4 rounded-full flex items-center justify-center transition-all duration-200 ease-in group-hover:bg-white hover:cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-8 text-white group-hover:text-black"
                >
                  <path
                    opacity="0.4"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M18.5822 5.41795C18.9728 5.80848 18.9728 6.44164 18.5822 6.83217L11.5822 13.8322C11.1917 14.2227 10.5585 14.2227 10.168 13.8322C9.77749 13.4416 9.77749 12.8085 10.168 12.418L17.168 5.41795C17.5585 5.02743 18.1917 5.02743 18.5822 5.41795Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M11.4985 13.7192C12.1754 14.396 12.7426 14.9632 13.1029 15.4459C13.4632 15.9287 13.7903 16.554 13.5355 17.2576C13.2808 17.9612 12.6293 18.2321 12.0433 18.3724C11.4575 18.5126 10.6587 18.5852 9.70544 18.6718L8.35108 18.7949C7.78911 18.846 7.28973 18.8915 6.8878 18.871C6.45305 18.8488 5.99316 18.7454 5.62447 18.3767C5.25578 18.008 5.15231 17.5481 5.13015 17.1134C5.10966 16.7114 5.15511 16.212 5.20625 15.6501L5.32937 14.2957L5.32937 14.2957C5.416 13.3424 5.48858 12.5436 5.62877 11.9578C5.76901 11.3719 6.03998 10.7203 6.74357 10.4656C7.44716 10.2109 8.07244 10.5379 8.55529 10.8983C9.03798 11.2585 9.60512 11.8257 10.282 12.5026L11.4985 13.7192L11.4985 13.7192Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div className="text-gray1 transition-all duration-200 ease-in group-hover:text-white">
                Receive
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-col gap-2 group items-center justify-center">
              <div className="size-[4.25rem] bg-gray4 rounded-full flex items-center justify-center transition-all duration-200 ease-in group-hover:bg-white hover:cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-8 text-white group-hover:text-black"
                >
                  <path
                    opacity="0.4"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.8322 10.1678C14.2227 10.5584 14.2227 11.1915 13.8322 11.582L6.83217 18.582C6.44164 18.9726 5.80848 18.9726 5.41795 18.582C5.02743 18.1915 5.02743 17.5584 5.41795 17.1678L12.418 10.1678C12.8085 9.77731 13.4416 9.77731 13.8322 10.1678Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M17.1134 5.13009C17.5481 5.15225 18.008 5.25572 18.3767 5.62441C18.7454 5.9931 18.8488 6.45299 18.871 6.88774C18.8915 7.28966 18.846 7.78904 18.7949 8.351L18.6718 9.70541V9.70542C18.5852 10.6587 18.5126 11.4575 18.3724 12.0433C18.2321 12.6292 17.9612 13.2808 17.2576 13.5355C16.554 13.7902 15.9287 13.4632 15.4459 13.1028C14.9632 12.7425 14.396 12.1754 13.7192 11.4985L13.7192 11.4985L12.5026 10.2819L12.5026 10.2819C11.8257 9.60506 11.2585 9.03792 10.8983 8.55522C10.5379 8.07238 10.2109 7.4471 10.4656 6.74351C10.7203 6.03992 11.3719 5.76895 11.9578 5.62871C12.5436 5.48852 13.3424 5.41594 14.2957 5.32931L15.6501 5.20619C16.212 5.15505 16.7114 5.1096 17.1134 5.13009Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div className="text-gray1 transition-all duration-200 ease-in group-hover:text-white">
                Send
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <a
              href="https://faucet.polkadot.io/westend"
              target="_blank"
              className="flex flex-col gap-2 group items-center justify-center"
            >
              <div className="size-[4.25rem] bg-gray4 rounded-full flex items-center justify-center transition-all duration-200 ease-in group-hover:bg-white hover:cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-8 text-white group-hover:text-black"
                >
                  <path
                    opacity="0.4"
                    d="M7.57686 4.21398C7.77748 3.75211 7.87779 3.52117 7.78894 3.3857C7.70009 3.25024 7.46547 3.25024 6.99624 3.25024L4.18182 3.25026C2.56262 3.25026 1.25 4.55982 1.25 6.17524V14.0465C1.24998 15.8244 1.24996 17.2574 1.40184 18.3845C1.55952 19.5546 1.89687 20.5398 2.68119 21.3223C3.4655 22.1048 4.45303 22.4414 5.6259 22.5987C6.75559 22.7502 8.19196 22.7502 9.97398 22.7502H15.978C17.3014 22.7502 18.3927 22.7502 19.2563 22.6344C20.1631 22.5128 20.9639 22.2476 21.6051 21.6079C22.2463 20.9682 22.512 20.1692 22.6339 19.2646C22.7501 18.4029 22.75 17.3142 22.75 15.994V13.9064C22.75 12.5862 22.7501 11.4974 22.6339 10.6358C22.512 9.73115 22.2463 8.93222 21.6051 8.29252C20.9639 7.65281 20.1631 7.38765 19.2563 7.26602C18.6295 7.14299 16.8093 7.13756 15.9776 7.15023L4.18138 7.15023C3.64164 7.15023 3.2041 6.71371 3.2041 6.17523C3.2041 5.63676 3.64164 5.20024 4.18138 5.20024H6.77242C6.99012 5.20024 7.09897 5.20024 7.17738 5.14397C7.25578 5.0877 7.29287 4.97795 7.36705 4.75843C7.42959 4.57336 7.49965 4.39175 7.57686 4.21398Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M19.5 15C19.5 13.8954 18.6046 13 17.5 13C16.3954 13 15.5 13.8954 15.5 15C15.5 16.1046 16.3954 17 17.5 17C18.6046 17 19.5 16.1046 19.5 15Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M19.4557 6.03151C19.563 6.0463 19.6555 5.95355 19.6339 5.84742C19.1001 3.22413 16.7803 1.25 13.9994 1.25C11.3264 1.25 9.07932 3.07399 8.43503 5.54525C8.38746 5.72772 8.52962 5.90006 8.7182 5.90006L15.9679 5.90006C16.3968 5.89365 17.0712 5.89192 17.7232 5.90742C18.3197 5.92161 19.0159 5.95164 19.4557 6.03151Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div className="text-gray1 transition-all duration-200 ease-in group-hover:text-white">
                Buy
              </div>
            </a>
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-col gap-2 group items-center justify-center">
              <div className="size-[4.25rem] bg-gray4 rounded-full flex items-center justify-center transition-all duration-200 ease-in group-hover:bg-white hover:cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-8 text-white group-hover:text-black"
                >
                  <path
                    d="M15.7138 4.29577C16.1006 4.69001 16.0945 5.32314 15.7003 5.70992L6.67027 14.5457L6.67025 14.5457C6.29581 14.9203 5.93244 15.2838 5.61629 15.5271C5.32406 15.7519 4.66669 16.1956 3.91819 15.905C3.16969 15.6145 3.04953 14.869 3.01731 14.5182C2.98245 14.1387 3.00694 13.6437 3.03216 13.1335L3.07997 12.1625C3.10435 11.6649 3.12813 11.1797 3.19945 10.803C3.26669 10.4478 3.45766 9.71857 4.20958 9.37706C4.97311 9.03027 5.59082 9.40861 5.86995 9.61238C6.16305 9.82634 6.4909 10.1544 6.82421 10.4879L7.39382 11.0575L14.2997 4.28227C14.6939 3.89549 15.327 3.90154 15.7138 4.29577Z"
                    fill="currentColor"
                  ></path>
                  <path
                    opacity="0.4"
                    d="M8.28619 19.7003C7.89941 19.3061 7.90546 18.673 8.29969 18.2862L17.3297 9.45037L17.3298 9.45036C17.7042 9.07576 18.0676 8.71225 18.3837 8.46902C18.6759 8.24421 19.3333 7.80051 20.0818 8.09106C20.8303 8.38161 20.9505 9.12713 20.9827 9.47788C21.0175 9.85736 20.9931 10.3524 20.9678 10.8626L20.92 11.8336C20.8956 12.3311 20.8719 12.8164 20.8006 13.1931C20.7333 13.5483 20.5423 14.2775 19.7904 14.619C19.0269 14.9658 18.4092 14.5875 18.13 14.3837C17.837 14.1697 17.5091 13.8417 17.1758 13.5082L16.6062 12.9386L9.70034 19.7138C9.3061 20.1006 8.67297 20.0946 8.28619 19.7003Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div className="text-gray1 transition-all duration-200 ease-in group-hover:text-white">
                Exchange
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
