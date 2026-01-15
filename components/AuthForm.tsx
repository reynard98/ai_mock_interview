"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"
import {toast} from "sonner"


import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import FormField from "@/components/FormField";
import {useRouter} from "next/navigation";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "@firebase/auth";
import {auth} from "@/firebase/client";
import {signIn, signUp} from "@/lib/action/auth.action";

const formSchema = z.object({
    username: z.string().min(2).max(50),
})

const authFormSchema = (type:FormType)=>{
    return z.object({
        name: type === 'sign-up' ? z.string().min(2).max(50) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6)

    })
}

const AuthForm = ({type} : {type:FormType}) => {

    const router = useRouter();
    const formSchema = authFormSchema(type)

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email:"",
            password: "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        try {
            if(type === "sign-up") {
                const {name, email, password} = values;

                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

                const result = await signUp({
                    uid : userCredentials.user.uid,
                    name : name!,
                    email,
                    password
                })

                if(!result?.success){
                    toast.error(result?.message);
                    return;
                }

                toast.success("Sign up successfully.");
                router.push("/sign-in");
            } else {
                const {email, password} = values;

                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                const idToken = await userCredential.user.getIdToken();

                if(!idToken){
                    toast.error("Sign In Failed.");
                    return;
                }

                await signIn({
                    email, idToken
                })

                toast.error("Sign in successfully.");
                router.push("/");            }
        } catch (error){
            console.log(error);
            toast.error("there was an error : {$error}")
        }
        console.log(values)
    }

    const isSignIn = type === 'sign-in'

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logoV2.png" alt="logo" height={32} width={38}/>
                    <h2 className="text-primary-100"> JOBI</h2>
                </div>
                <h3>Practice job interview with AI</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && <FormField
                                control={form.control}
                                name="name"
                                label="name"
                                placeholder="Enter your name" />
                                }
                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="your email address"
                            type="email"
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your Password"
                            type="password"
                        />

                        <Button type="submit" className={"btn"}>{isSignIn ? 'sign in' : 'Create an account'}</Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? 'No Account Yet?' : 'have an account?'}
                    <Link href={isSignIn ? '/sign-up' : '/sign-in'} className={"font-bold text-user-primary ml-1"}>{isSignIn ? 'Sign-up' : 'sign-in'}</Link>
                </p>
            </div>
            </div>
    )
}
export default AuthForm
