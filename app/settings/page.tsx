import { getUser } from "@/lib/session";
import { SignInPrompt } from "@/components/foundation/sign-in-prompt";
import { AccountSettings } from "@/components/foundation/account-settings";
export const metadata={title:"Settings",robots:{index:false,follow:false}};
export default async function Page(){const user=await getUser();return user?<AccountSettings user={user}/>:<SignInPrompt/>;}
