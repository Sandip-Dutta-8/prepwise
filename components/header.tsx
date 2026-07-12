import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { checkUser } from '@/lib/checkUser'
import { CalendarDays, Users } from 'lucide-react'
import CreditButton from './creditButton'

const Header = async () => {

    const user = await checkUser();

    return (
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-3 sm:px-10 py-3 border-b border-white/7 backdrop-blur-xl">
            <Link href="/">
                <Image
                    src="/logo.png"
                    alt="Prept Logo"
                    width={200}
                    height={200}
                    className="h-11 w-auto"
                />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
                <Show when="signed-out">
                    <SignInButton>
                        <Button variant="ghost">
                            Sign In
                        </Button>
                    </SignInButton>
                    <SignUpButton>
                        <Button variant="gold">Get started →</Button>
                    </SignUpButton>
                </Show>
                <Show when="signed-in">
                    {user?.role === "INTERVIEWER" && (
                        <Button variant="ghost">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    )}

                    {user?.role === "INTERVIEWEE" && (
                        <>
                            <Button variant="ghost">
                                <Link href="/explore" className='flex justify-center items-center gap-1.5'>
                                    <Users size={16} />
                                    <span className="hidden md:inline">Explore</span>
                                </Link>
                            </Button>
                            <Button variant="default">
                                <Link href="/appointments" className='flex justify-center items-center gap-1.5'>
                                    <CalendarDays size={16} />
                                    <span className="hidden md:inline">My Appointments</span>
                                </Link>
                            </Button>
                        </>
                    )}

                    <CreditButton
                        role={user?.role === "INTERVIEWER" ? "INTERVIEWER" : "INTERVIEWEE"}
                        credits={
                            (user?.role === "INTERVIEWER"
                                ? user?.creditBalance
                                : user?.credits) ?? 0
                        }
                    />
                    <UserButton />
                </Show>
            </div>
        </nav>
    )
}

export default Header