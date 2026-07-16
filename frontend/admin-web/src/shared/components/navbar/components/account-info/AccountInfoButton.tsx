import { useState } from "react";
import { ChevronDown, UserIcon } from "lucide-react";

import { AccountInfoDropdown } from "./AccountInfoDropdown";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { userStoreFullName, userStoreImage } from "@/modules/auth/stores/auth.store.selectors";

interface Props {
    logout: () => void;
}

export const AccountInfoButton = ({ logout }: Props) => {
    const loggedInUserFullName = useAuthStore(userStoreFullName);
    const loggedInUserImage = useAuthStore(userStoreImage) || "https://gravatar.com/avatar/569a633053dd643d3f4daa8ed6a5a16e?s=400&d=robohash&r=x"

    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);

    return (
        <>
            <section className="relative">

                <button data-testid="header-user-menu" className="cursor-pointer flex items-center gap-3 pl-2 pr-1 py-1 rounded-full" onClick={() => setToggleDropdown(!toggleDropdown)}>
                    <span className="hidden md:inline text-sm font-medium text-foreground">
                        {loggedInUserFullName || "Usuario"}
                    </span>
                    {
                        loggedInUserImage ?
                            (
                                <>
                                    <img className="ml-2 w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                                        alt="avatar"
                                        src={loggedInUserImage} />
                                </>
                            ) :
                            (
                                <div className="ml-2 w-10 h-10 rounded-full bg-muted ring-2 ring-primary/15 flex items-center justify-center overflow-hidden">
                                    <UserIcon className="w-5 h-5 text-muted-foreground/60" />
                                </div>
                            )
                    }
                    <ChevronDown className="hidden md:inline w-4 h-4 text-muted-foreground" />

                </button>

                {
                    toggleDropdown && (
                        <AccountInfoDropdown toggleDropdown={setToggleDropdown} logout={logout} />
                    )
                }

            </section>
        </>
    )
}
