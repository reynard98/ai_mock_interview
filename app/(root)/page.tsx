import React from 'react'
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard"
import {getCurrentUser} from "@/lib/action/auth.action";
import {getInterviewsByUserId, getLatestInterviews} from "@/lib/action/general.action";



const Page = async  () => {
    const user = await getCurrentUser();

    const [userInterviews, latestInterviews] = await Promise.all([
        await getInterviewsByUserId(user?.id!),
        await getLatestInterviews({userId: user?.id!})
    ])

    const hasPastInterviews = userInterviews?.length > 0;
    const hasUpcomingInterviews = latestInterviews?.length > 0;
    return (
        <>
            <section className={"card-cta"}>
                <div className="flex flex-col gap-6 max-w-lg">
                        <h2 className={"leading-11 font-bold"}>AIで面接を練習しよう</h2>
                        <p className={"font-semibold text-lg text-primary-100"}>本番さながらの面接質問で練習して、すぐにフィードバックがもらえるる </p>
                        <Button asChild className={"btn-primary max-sm:w-full"}><Link href={"/interview"}>面接をセットする</Link></Button>
                </div>
                <Image src={"/robotDude.png"} alt={"robo-dude"} width={250} height={250} className="max-sm:hidden"/>
            </section>

            <section className={"interviews-list flex flex-col gap-6 mt-8"}>
                <h2>あなたの面接</h2>
                <div className={"interviews-section"}>
                    {
                        hasPastInterviews ? (
                            userInterviews?.map((interview) => (
                                <InterviewCard {...interview} key={interview.id} />
                            ))) : (<p>You haven&apos;t take any interviews yet</p>)
                    }

                </div>
            </section>

            <section className={"flex flex-col gap-6 mt-8"}>
                <h2>面接を受ける</h2>
                <div className={"interviews-section"}>
                    {
                        hasUpcomingInterviews ? (
                            latestInterviews?.map((interview) => (
                                <InterviewCard {...interview} key={interview.id} />
                            ))) : (<p>現在、利用可能な面接はありません。</p>)
                    }
                </div>
            </section>
        </>
    )
}
export default Page
