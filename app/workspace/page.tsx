import { getUser } from "@/lib/session";
import { personalWorkspace } from "@/lib/workspace";
import { listRecords } from "@/lib/records";
import { SignInPrompt } from "@/components/foundation/sign-in-prompt";
import { Workspace } from "@/components/foundation/workspace";
export const metadata={title:"Workspace",robots:{index:false,follow:false}};
export default async function Page(){const user=await getUser();if(!user)return <SignInPrompt/>;const workspace=await personalWorkspace(user.id);return <Workspace key={user.id} workspace={workspace} initial={await listRecords(workspace.id)}/>;}
