'use client'

import { User } from "@prisma/client"
import UserBox from "./UserBox"
import { FullUserLetter } from "@/app/types"
import { useEffect, useState } from "react"

interface UserListProps {
    items: FullUserLetter | never[]
}

const UserList: React.FC<UserListProps> = ({items}) => {    

    const [allContacts, setAllContacts] = useState([]);
    const [searchContacts, setSearchContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

  return (
    <aside className="fixed inset-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200 block 2-full left-0">
        <div className="px-5">
            <div className="flex-col">
                <div className="text-2xl font-bold text-neutral-800 py-4">
                    People
                </div>
            </div>
            {Object.entries(items).map(([initialLetter, listUser], index) => {
                return (
                    <>
                        <div key={index} className="w-full py-3 font-semibold">{initialLetter}</div>
                        {listUser.map((item) => (
                            <UserBox key={item.id} data={item} />
                        ))}
                    </>
                )
            })}
        </div>
    </aside>
  )
}

export default UserList