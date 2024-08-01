'use client';

import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/components/Avatar";
import { Conversation, User } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { HiEllipsisHorizontal, HiMiniVideoCamera } from "react-icons/hi2";
import ProfileDrawer from "./ProfileDrawer";
import AvatarGroup from "@/components/AvatarGroup";
import useActiveList from "@/app/hooks/useActiveList";
import { MdPhone } from "react-icons/md";
import { useRouter } from "next/navigation";

interface HeaderProps {
    conversation: Conversation & {
        users: User[]
    };
    onStartVoiceCall: () => void;
    onStartVideoCall: () => void;
};

const Header: React.FC<HeaderProps> = ({ conversation, onStartVoiceCall, onStartVideoCall }) => {
    const router = useRouter();
    const otherUser = useOtherUser(conversation);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const {members} = useActiveList();
    const isActive = members.indexOf(otherUser?.email!) !== -1;

    const statusText = useMemo(() => {
        if(conversation.isGroup) {
            return `${conversation.users.length} members`;
        }

        return isActive ? 'Active' : 'Offline';
    }, [conversation, isActive]);
  return (
    <>
        <ProfileDrawer data={conversation} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
            <div className="flex gap-3 items-center">
                <Link href="/conversations" 
                className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer">
                    <HiChevronLeft size={32} />
                </Link>
                {conversation.isGroup ? (
                    <AvatarGroup users={conversation.users} />
                ) : (
                    <Avatar user={otherUser} />
                )}
                <div className="flex flex-col">
                    <div>
                        {conversation.name || otherUser.name}
                    </div>
                    <div className="text-sm font-light text-neutral-500">
                        {statusText}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
            <MdPhone className="text-sky-500 cursor-pointer hover:text-sky-600 transition" size={25} onClick={onStartVoiceCall} /> 
            <HiMiniVideoCamera className="text-sky-500 cursor-pointer hover:text-sky-600 transition" size={25} onClick={onStartVideoCall} />
            <HiEllipsisHorizontal size={32} onClick={() => {setDrawerOpen(true)}} className="text-sky-500 cursor-pointer hover:text-sky-600 transition" />
            </div>
        </div>
    </>
  )
}

export default Header;