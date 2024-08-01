"use client";

import { pusherClient } from "@/app/libs/pusher";
import Button from "@/components/Button";
import { Conversation, User } from "@prisma/client";
import axios from "axios";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdCallEnd } from "react-icons/md";

interface CallDisplayPageProps {
  conversation:
    | (Conversation & {
        users: User[];
      })
    | null;
    connecter?: User | null;
    currentUser: User | null;
    onRejectCall: () => void;
    typeCall: boolean;
    soundLevel?: number;
}

const CallDisplayPage: React.FC<CallDisplayPageProps> = ({ conversation, connecter, currentUser, onRejectCall, typeCall, soundLevel }) => {
    const [active, setActive] = useState<boolean>(typeCall);

    const [start, setStart] = useState(!typeCall);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);

    useEffect(() => {
      const target = new Date();
      const interval = setInterval(() => {
        const now = new Date();
        const difference = now.getTime() - target.getTime(); 

        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setMinute(m);

        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setSecond(s);
      }, 1000);

      if(start == false) {
        clearInterval(interval);
        setSecond(0);
        setMinute(0);
      }
      return () => clearInterval(interval);
    }, [start]);

    useEffect(() => {
      pusherClient.subscribe(conversation?.id!);
  
      const handleRejectCall = ( callee: any ) => {
        if(currentUser?.id.includes(callee.id)) {
          onRejectCall();
          setStart(false);
        }
      }

      const acceptHandle = async (res: string) => {
        // if (res === "ACCEPT") {
          setStart(true);
        // }
      };
  
    pusherClient.bind("call:reject", handleRejectCall);
    pusherClient.bind("call:accept", acceptHandle);

    return () => {
      pusherClient.unsubscribe(conversation?.id!);
      pusherClient.unbind("call:reject", handleRejectCall);
      pusherClient.bind("call:accept", acceptHandle);
    }
    }, [conversation?.id]);

    const handleRejectCall = async () => {
        if(typeCall) {
          await axios.post("/api/call", {
            conversationId: conversation?.id,
            callee: connecter,
            type: "REJECT",
          });
        }
        onRejectCall();
      };

  return (
    <div className={clsx("h-full", 
      !active && "relative w-full p-3"
    )}>
      <div className={clsx("h-full flex flex-col items-center justify-center gap-12", 
        !active && "absolute inset-0 w-full z-20"
      )}>
      <div className="text-center">
        <h2 className={clsx("text-5xl font-semibold", !active && "text-white")}>
          {connecter?.name}
        </h2>
        <p className={clsx("mt-2 font-medium")}>
          {typeCall && <span className={clsx( !active && "text-white")}>Calling...</span> }
          {!typeCall && 
          <span className={clsx("transition duration-300", soundLevel! > 1 ? "text-green-500" : "text-white")}>{minute > 9 ? minute : "0" + minute} : {second > 9 ? second : "0" + second}</span>
          }
        </p>
      </div>
      <div className={clsx("w-52 h-52 relative left-1 z-20 after:absolute after:inline-flex after:w-52 after:h-52 after:rounded-full after:scale-100 after:bg-red-200 after:opacity-0 after:z-10",
        active && "after:animate-ping-call"
      )}>
        <Image
          className={clsx("absolute inline-flex z-20 object-cover rounded-full overflow-hidden shadow-lg",
            active && "animate-zoom-calling"
          )}
          alt="Avatar"
          src={connecter?.image || "/images/placeholder.jpg"}
          width={200} height={200}
        />
      </div>
      <div>
        <Button danger type="button" onClick={handleRejectCall}>
          <MdCallEnd size={30} />
        </Button>
      </div>
      </div>
      {!active && <div className="absolute inset-0 z-0 w-full h-full p-3">
        <div className="h-full overflow-hidden rounded-lg relative">
        <Image
            className="absolute object-cover overflow-hidden shadow-lg blur-md inset-0 z-10"
            alt="Avatar"
            src={connecter?.image || "/images/placeholder.jpg"}
            width={1140} height={500}
          />
          <div className="absolute w-full h-full bg-black opacity-40 z-20"></div>
        </div>
      </div>}
    </div>
  );
};

export default CallDisplayPage;
