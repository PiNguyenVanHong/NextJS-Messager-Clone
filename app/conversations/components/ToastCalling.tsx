import { pusherClient } from "@/app/libs/pusher";
import Button from "@/components/Button";
import { User } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiPhoneCall } from "react-icons/fi";
import { MdOutlineCallEnd } from "react-icons/md";
import { PiVideoCameraFill } from "react-icons/pi";

interface ToastCallingProps {
  connecter: User;
  onReject: () => void;
  onAccept: () => void;
  conversationId: string;
  typeCall: string;
}

const ToastCalling: React.FC<ToastCallingProps> = ({
  connecter,
  onReject,
  onAccept,
  conversationId,
  typeCall,
}) => {
  const handleRejectCall = async () => {
    await axios.post("/api/call", {
      conversationId,
      callee: connecter,
      type: "REJECT",
    });
    onReject();
  };

  const handleAcceptCall = async () => {
    onReject();
    onAccept();
    await axios.post("/api/call", {
      conversationId,
      type: "ACCEPT",
    });
  };

  useEffect(() => {
    pusherClient.subscribe(conversationId);

    const handleRejectCall = (callee: any) => {
      if (callee.id !== connecter.id) {
        onReject();
      }
    };

    pusherClient.bind("call:reject", handleRejectCall);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("call:reject", handleRejectCall);
    };
  }, [conversationId]);

  return (
    <div className="p-3 w-[356px] rounded-lg bg-[#fcfcfc] shadow-lg relative border border-[#ededed]">
      <div className="flex gap-3 items-center bg-white">
        <div className="h-14 w-14 overflow-hidden rounded-md">
          <Image
            className="w-full h-full object-cover"
            alt="Avatar"
            src={connecter.image || "/images/placeholder.jpg"}
            height={150}
            width={150}
          />
        </div>
        <div>
          <h4 className="line-clamp-1 text-base font-medium">
            {connecter.name}
          </h4>
          {typeCall === "VOICE" && (
            <p className="text-xs">Incoming Voice Call</p>
          )}
          {typeCall === "VIDEO" && (
            <p className="text-xs">Incoming Video Call</p>
          )}
        </div>
        <div className="flex gap-1 items-center ml-auto">
          <Button danger onClick={handleRejectCall}>
            <MdOutlineCallEnd className="animate-ring-calling" size={20} />
          </Button>
          {typeCall === "VOICE" && (
            <Button onClick={handleAcceptCall}>
              <FiPhoneCall className="animate-ring-calling" size={20} />
            </Button>
          )}
          {typeCall === "VIDEO" && (
            <Button onClick={handleAcceptCall}>
              <PiVideoCameraFill className="animeat-ring-calling" size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToastCalling;
