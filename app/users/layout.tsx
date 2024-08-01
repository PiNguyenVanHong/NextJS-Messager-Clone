import Sidebar from "@/components/sidebar/Sidebar";
import UserList from "@/app/users/components/UserList";
import { getUserByLetter, getUsers } from "@/app/actions/getUsers";

export default async function Userslayout({
    children
}: {children: React.ReactNode;
}) {
    // const users = await getUsers();
    const users = await getUserByLetter();
    return (
        // @ts-expect-error Server Component
        <Sidebar>
            <div className="h-full">
                <UserList items={users} />
                {children}
            </div>
        </Sidebar>
    )
};