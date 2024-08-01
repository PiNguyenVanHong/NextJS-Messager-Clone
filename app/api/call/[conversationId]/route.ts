import getCurrentUser from "@/app/actions/getCurrentUser";
import { generateToken04 } from "@/app/libs/generateToken";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  conversationId: string;
}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { conversationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
        return new NextResponse("Conversation ID is required", { status: 401 });
      }

    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
    const severSercet = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
    const effectiveTime = 3600;
    const payload = "";

    if (appId && severSercet && conversationId) {
        const token = generateToken04(
          appId,
          currentUser.id,
          severSercet,
          effectiveTime,
          payload
        );
        return NextResponse.json({token});
    } else {
        return new NextResponse("Generate Token room error", { status: 500 });
    }
  } catch (error) {
    console.log(error, "ERROR_CALL_GET");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request, { params } : { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unautorized", { status: 401 });
    }     

    if(!params.conversationId) {
      return new NextResponse("Invalid Data", { status: 400 });
    }

    await pusherServer.trigger(params.conversationId, "call:end-call", "END");
    return NextResponse.json("End Call Successfully", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal End-Call Error", { status: 500 });
  }
}
