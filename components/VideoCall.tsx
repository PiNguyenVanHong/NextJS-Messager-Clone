// import { useEffect, useRef } from 'react';
// import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

// const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID!; 
// const server = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

// const VideoCall = () => {
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   let zg: ZegoExpressEngine;

//   useEffect(() => {
//     // Initialize ZEGOCLOUD SDK
//     zg = new ZegoExpressEngine(Number(appID), server);

//     // Join a room
//     zg.loginRoom('room1', "token", { userID: 'user1', userName: 'User 1' });

//     // Start publishing local stream
//     zg.startPublishingStream('stream1', localVideoRef.current);

//     // Start playing remote stream
//     zg.on("", (streamList: any) => {
//       zg.startPlayingStream(streamList[0].streamID, remoteVideoRef.current);
//     });

//     // Clean up on component unmount
//     return () => {
//       zg.logoutRoom('room1');
//       zg.destroyEngine();
//     };
//   }, []);

//   return (
//     <div>
//       <video ref={localVideoRef} autoPlay muted />
//       <video ref={remoteVideoRef} autoPlay />
//     </div>
//   );
// };

// export default VideoCall;
