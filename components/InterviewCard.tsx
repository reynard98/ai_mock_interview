import dayjs from "dayjs";
import Image from "next/image";
import {getRandomInterviewCover} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import {getFeedbackByInterviewId} from "@/lib/action/general.action";

const InterviewCard = async ({id, userId, role, type, techstack, createdAt}: InterviewCardProps) =>{
    const feedback = userId && id ? await getFeedbackByInterviewId({interviewId: id, userId}) : null;
    const normalizedType = /mix/gi.test(type) ? 'mix' : type;
    const formattedDate = dayjs(feedback ?.createdAt || createdAt || Date.now()).format('YYYY-MM-DD');

    return (
        <div className={"card-border w-[360px] max-sm:w-full min-h-96"}>
            <div className={"card-interview"}>
                <div className={"flex flex-col gap-2"}>
                    <div className={"absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600 "}>
                        <p className={"badge-text"}>{normalizedType}</p>
                    </div>
                    <Image src={getRandomInterviewCover()} alt={"cover image"} width={90} height={90} className={"rounded-full object-fit size-[90px]"}/>
                    <h3 className={"mt-5 capitalize font-bold text-xl"}>{role} インタビュー</h3>
                    <div className={"flex flex-row gap-5 mt-3"}>
                        <div className={"flex flex-row gap-2"}>
                            <Image src={"/calendar.svg"} alt={"calendar"} width={22} height={22}/>
                            <p>{formattedDate}</p>
                        </div>

                        <div className={"flex flex-row gap-2 items-center"}>
                            <Image src={"/star.svg"} alt={"star"} width={22} height={22}/>
                            <p>{feedback?.totalScore || '---'}/100</p>
                        </div>
                    </div>

                    <p className={"line-clamp-2 leading-6"}>
                        {feedback?.finalAssessment || "まだ面接を受けていません。スキルアップのために、今すぐ受けてみましょう。"}
                    </p>
                </div>
                <div className={"flex flex-row justify-between"}>
                    <DisplayTechIcons techStack={techstack}/>
                    <Button className={"btn-primary"}>
                        <Link href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
                            {feedback ? '評価を見る' : '面接を実施'} </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default InterviewCard
