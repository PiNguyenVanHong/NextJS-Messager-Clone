import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import EmptyState from "@/components/EmptyState";
import ConversationContainerPage from "@/app/conversations/[conversationId]/components/ConversationContainer";

import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
    conversationId: string;
};

const ConversationId = async ({ params }: {params: IParams}) => {

    const conversation = await getConversationById(params.conversationId);
    const messages = await getMessages(params.conversationId);

    const currentUser = await getCurrentUser();
    const connecter = conversation?.users.filter((u) => u.email !== currentUser?.email)[0];

    if(!conversation) {
        return (
            <div className="lg:pl-80 h-full">
                <div className="h-full flex flex-col">
                    <EmptyState />
                </div>
            </div>
        );
    }

    return (
        <div className="lg:pl-80 h-full">
            <div className="h-full flex flex-col">
                <ConversationContainerPage conversation={conversation} initialMessages={messages} currentUser={currentUser!} connecter={connecter!} />
            </div>
        </div>
    )
};

export default ConversationId;