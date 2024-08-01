'use client';

import useActiveList from "@/app/hooks/useActiveList";
import { pusherClient } from "@/app/libs/pusher";
import { User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AvatarProgs {
    user?: User
}

const Avatar: React.FC<AvatarProgs> = ({user}) => {
  const { members, set, add, remove } = useActiveList();
  const [isActive, setIsActive] = useState<boolean>(members?.includes(user?.email!) ? true : false);

  useEffect(() => {   
    setIsActive(members?.includes(user?.email!) ? true : false);

  }, [user, members, add, remove]);

  useEffect(() => {
    pusherClient.subscribe(user?.email!);
    const handleActive =  (data: any) => {
      if(members.includes(data)) {
        setIsActive(true);
      }
    }
    
    pusherClient.bind('active:update', handleActive);

    return () => {
      pusherClient.unsubscribe(user?.email!);
      pusherClient.unbind('active:update');
    }
  }, [user]);

  return (
    <div className="relative">
        <div className="relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11">
            <Image alt="Avatar" src={user?.image || '/images/placeholder.jpg'} fill />
        </div>
        {isActive && (
          <span className="absolute block rounded-full bg-green-500 ring-2 ring-white top-0 right-0 h-2 w-2 md:h-3 md:w-3"></span>
        )}
        
    </div>
  )
}

export default Avatar;