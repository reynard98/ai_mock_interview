import React, {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated} from "@/lib/action/auth.action";
import {redirect} from "next/navigation";

const RootLayout =  ({children}:{children : ReactNode}) => {
    // const isUserAuthenticated = await isAuthenticated();
    //
    // if (!isUserAuthenticated) redirect('/sign-in');

    return (
        <div className="root-layout">
            <nav>
                <Link href="/" className={"flex items-center"}>
                    <Image src="/logoV2.png" alt={"logo"} width={72} height={72} />
                    <h2 className="text-primary-100 text-4xl">JOBI</h2>
                </Link>
            </nav>
            {children}
        </div>
    )
}
export default RootLayout
