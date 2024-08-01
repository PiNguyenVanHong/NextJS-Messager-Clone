"use client";

import { FullMessageType } from "@/app/types";
import { Conversation, User } from "@prisma/client";
import Header from "./Header";
import Body from "./Body";
import Form from "./Form";
import { useEffect, useState } from "react";
import { pusherClient } from "@/app/libs/pusher";
import CallDisplayPage from "./CallDisplay";
import ToastCalling from "../../components/ToastCalling";
import { toast } from "sonner";
import axios from "axios";
import Button from "@/components/Button";
import { MdCallEnd } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import clsx from "clsx";

interface ConversationContainerPageProps {
  conversation: Conversation & {
    users: User[];
  };
  initialMessages: FullMessageType[];
  currentUser: User;
  connecter: User;
}

const ConversationContainerPage: React.FC<ConversationContainerPageProps> = ({
  conversation,
  initialMessages,
  currentUser,
  connecter,
}) => {
  const [active, setActive] = useState(false);
  const [isAccept, setIsAccept] = useState(false);

  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState<any>(undefined);
  const [localStream, setLocalStream] = useState<any>(undefined);
  const [publishStream, setPublishStream] = useState<any>(undefined);
  const [roomID, setRoomID] = useState(conversation.id);
  const [typeCall, setTypeCall] = useState("");

  const [soundLevel, setSoundLevel] = useState(0);

  const incomingCallVideo = async () => {
    setActive(true);
    setTypeCall("VIDEO");
    await axios.post("/api/call", {
      conversationId: conversation.id,
      callerId: currentUser.id,
      callee: connecter,
      type: "INCOMING",
      typeCall: "VIDEO",
      timeStamp: new Date().getTime(),
    });
  };

  const incomingCallVoice = async () => {
    setActive(true);
    setTypeCall("VOICE");
    await axios.post("/api/call", {
      conversationId: conversation.id,
      callerId: currentUser.id,
      callee: connecter,
      type: "INCOMING",
      typeCall: "VOICE",
    });
  };

  const endCall = () => {
    setToken(undefined);
    setIsAccept(false);
    setActive(false);
  };

  const handleRejectCall = async () => {

    if (!!zgVar && !!localStream && !!publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(roomID);
    }

    setActive(false);
    setIsAccept(false);
    setTypeCall("");
  };

  useEffect(() => {
    pusherClient.subscribe(conversation.id);

    const callHandle = ({ callerId, callee, typeCall }: any) => {
      if (callerId === currentUser.id) {
        toast.custom(
          (t) => (
            <ToastCalling
              onReject={() => toast.dismiss(t)}
              onAccept={() => {
                setActive(true);
              }}
              typeCall={typeCall}
              conversationId={conversation.id}
              connecter={callee}
            />
          ),
          {
            duration: Infinity,
          }
        );
        setTypeCall(typeCall);
      }
    };

    const acceptHandle = async (res: string) => {
      if (res === "ACCEPT") {
        try {
          const {
            data: { token: returnedToken },
          } = await axios.get(`/api/call/${conversation.id}`);

          setToken(returnedToken);
        } catch (error) {
          console.log(error);
        }
      }
    };

    const a = (res: any) => {
      setActive(false);
      setIsAccept(false);
      setTypeCall("");
    };

    pusherClient.bind("call:reject", a);
    pusherClient.bind("call:incoming", callHandle);
    pusherClient.bind("call:accept", acceptHandle);

    return () => {
      pusherClient.unsubscribe(conversation.id);
      pusherClient.unbind("call:reject", a);
      pusherClient.unbind("call:incoming", callHandle);
      pusherClient.unbind("call:accept", acceptHandle);
    };
  }, [conversation.id]);

  useEffect(() => {
    pusherClient.subscribe(currentUser.id);

    const a = () => {
      alert("Có nhận được")
      // if (!!zgVar && !!localStream && !!publishStream) {
      //   zgVar.destroyStream(localStream);
      //   zgVar.stopPublishingStream(publishStream);
      //   zgVar.logoutRoom(roomID);
      // }
  
      // setActive(false);
      // setIsAccept(false);
      // setTypeCall("");
    }

    return () => {
      pusherClient.unsubscribe(currentUser.id);
      pusherClient.unbind("call:end-call", a);
    };
  }, [currentUser.id])

  useEffect(() => {
    
    const startCall = async () => {
      import("zego-express-engine-webrtc").then(
        async ({ ZegoExpressEngine }) => {
          const zg = new ZegoExpressEngine(
            parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!),
            process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!
          );

          setZgVar(zg);

          zg.on(
            "roomStreamUpdate",
            async (roomID, updateType, streamList, extendedData) => {
              if (updateType === "ADD") {
                const rmVideo = document.getElementById(
                  "remote-video"
                ) as HTMLElement;
                const vd = document.createElement(
                  "Video"
                ) as HTMLVideoElement;

                if (typeCall === "VIDEO") {
                  vd.id = streamList[0].streamID;
                  vd.className =
                    "w-full absolute top-1/2 -translate-y-1/2 z-0";
                  vd.autoplay = true;
                  vd.playsInline = true;
                  vd.muted = false;

                  if (rmVideo) {
                    rmVideo.appendChild(vd);
                  }
                }

                await zg
                  .startPlayingStream(streamList[0].streamID, {
                    audio: true,
                    video: typeCall === "VIDEO" ? true : false,
                  })
                  .then((stream) => {
                    vd.srcObject = stream;
                  })
                  .catch((err) => console.log(err));
              } else if (
                updateType == "DELETE" && zg
              ) {

                alert("Có người rời khỏi phòng")
                zg.destroyStream(localStream);
                zg.stopPlayingStream(streamList[0].streamID);
                zg.stopPublishingStream(streamList[0].streamID);
                zg.logoutRoom(roomID);
                // await axios.delete(`/api/call/${connecter.id}`);
              }
            }
          );
          await zg
            .loginRoom(
              roomID,
              token!,
              {
                userID: currentUser.id.toString(),
                userName: currentUser.name?.toString() || "Name trong",
              },
              { userUpdate: true }
            )
            .catch((error) => console.log("Loi Login", error));

          zg.setSoundLevelDelegate(true, 1000);

          zg.on("soundLevelUpdate", (soundLevelList) => {
            if (soundLevelList.length > 0) {
              setSoundLevel(soundLevelList[0].soundLevel);
            }
          });

          if (typeCall === "VIDEO") {
            const localStream2 = await zg.createStream({
              camera: {
                audio: true,
                video: true,
              },
            });
            
              const localVideo = document.getElementById(
                "local-video"
              ) as HTMLElement;
              const videoElement = document.createElement(
                "Video"
              ) as HTMLVideoElement;
  
              videoElement.id = "Video-Local-ZEGO";
              videoElement.className = "w-52 absolute z-10 inset-0";
              videoElement.autoplay = true;
              videoElement.muted = false;
              videoElement.playsInline = true;
  
              localVideo?.appendChild(videoElement);
  
              const td = document.getElementById(
                "Video-Local-ZEGO"
              ) as HTMLVideoElement;
  
              td.srcObject = localStream2;
  
              const streamID = "123" + new Date().getTime().toString();
              console.log("Khởi tạo local: ", localStream2.id);
              
              setPublishStream(streamID);
              setLocalStream(localStream2);
              zg.startPublishingStream(streamID, localStream2);
            
            
          } else if (typeCall === "VOICE") {
            const localStream = await zg.createZegoStream({
              camera: {
                audio: true,
                video: false,
              },
            });

            localStream.playAudio();

            const streamID = "123" + new Date().getTime().toString();

            setPublishStream(streamID);
            setLocalStream(localStream);
            zg.startPublishingStream(streamID, localStream);
          } 
        
      });
    };

    if (!!token) {
      setActive(false);
      setIsAccept(true);

      startCall();
    }
  }, [token]);

  useEffect(() => {
    if (localStream) {
        console.log("localStream has been updated:", localStream);
    }
}, [localStream]);

  return (
    <>
      {active && (
        <CallDisplayPage
          conversation={conversation}
          connecter={connecter}
          currentUser={currentUser}
          onRejectCall={endCall}
          typeCall={true}
        />
      )}
      {isAccept && typeCall === "VIDEO" && (
        <div className="h-full w-full p-3">
          <div
            id="remote-video"
            className="relative h-full w-full overflow-hidden rounded-3xl"
          >
            <div className="absolute top-5 right-5">
              <div
                id="local-video"
                className="relative w-52 h-[9.75rem] rounded-xl overflow-hidden transition duration-300 shadow-xl"
              >
                <div className="absolute z-20 bottom-1 right-4 flex gap-2">
                  <h2 className="text-sm font-medium text-white line-clamp-1">
                    {currentUser?.name}
                  </h2>
                  <FaMicrophone
                    className={clsx(
                      "text-white transition duration-300",
                      soundLevel > 1 && "animate-bounce text-green-500"
                    )}
                  />
                </div>
                <div></div>
              </div>
            </div>
            <div className="flex justify-center w-full absolute bottom-3 z-10">
              <div className="w-52 flex justify-center p-2 bg-white/30 backdrop-blur-sm shadow-md rounded-full">
                <Button danger onClick={handleRejectCall}>
                  <MdCallEnd size={30} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAccept && typeCall === "VOICE" && (
        <>
          <CallDisplayPage
            conversation={conversation}
            connecter={connecter}
            currentUser={currentUser}
            onRejectCall={handleRejectCall}
            soundLevel={soundLevel}
            typeCall={false}
          />
          <div id="remote-video" className="hidden"></div>
          <div id="local-video" className="hidden"></div>
        </>
      )}
      {!active && !isAccept && (
        <>
          <Header
            onStartVoiceCall={incomingCallVoice}
            onStartVideoCall={incomingCallVideo}
            conversation={conversation}
          />
          <Body initialMessages={initialMessages} />
          <Form />
        </>
      )}
    </>
  );
};

export default ConversationContainerPage;
