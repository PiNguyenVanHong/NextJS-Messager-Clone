import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unautorized", { status: 401 });
    }

    const body = await request.json();
    const { conversationId, callerId, callee, type, typeCall } = body;

    if (!conversationId || !type) {
      return new NextResponse("Invalid Data", { status: 400 });
    }

    if (type === "INCOMING") {
       await pusherServer.trigger(conversationId, "call:incoming", {
        callerId: callee?.id,
        callee: currentUser,
        typeCall,
        timestamp: new Date().getTime(),
      });
    } else if (type === "REJECT") {
      await pusherServer.trigger(conversationId, "call:reject", callee);
      return NextResponse.json("The room finished", { status: 200 });
    } else if (type === "ACCEPT") {
      await pusherServer.trigger(conversationId, "call:accept", "ACCEPT");
      return NextResponse.json("Create room Successfully", { status: 200 });
    }

    return NextResponse.json("Success", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Calling Error", { status: 500 });
  }
}