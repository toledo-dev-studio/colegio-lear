import { useState } from "react";
import { ChevronDown, UserIcon } from "lucide-react";

import { AccountInfoDropdown } from "./AccountInfoDropdown";
import { useAuthStore } from "@/stores/auth-store/auth.store";

interface Props {
    logout: () => void;
}

export const AccountInfoButton = ({ logout }: Props) => {
    const { user } = useAuthStore();
    
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);

    return (
        <>
            <section className="relative">

                <button data-testid="header-user-menu" className="cursor-pointer flex items-center gap-3 pl-2 pr-1 py-1 rounded-full" onClick={() => setToggleDropdown(!toggleDropdown)}>
                    <span className="hidden md:inline text-sm font-medium text-foreground">
                        {user?.fullName || "Usuario"}
                    </span>
                    {
                        user?.avatar ?
                            (<img className="ml-2 w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" alt={user.fullName} src={user.avatar} />) :
                            (
                                <div className="ml-2 w-10 h-10 rounded-full bg-muted ring-2 ring-primary/15 flex items-center justify-center overflow-hidden">
                                    <UserIcon className="w-5 h-5 text-muted-foreground/60" />
                                </div>
                            )
                    }
                    <ChevronDown className="inline w-4 h-4 text-muted-foreground" />

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
