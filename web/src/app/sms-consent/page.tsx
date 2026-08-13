import Link from 'next/link'
import Image from 'next/image'

// Public evidence of the SMS opt-in workflow, written for Twilio toll-free
// verification. The real opt-in happens inside the iOS app, which a compliance
// reviewer cannot reach, so this page reproduces the workflow and the exact
// user-facing consent language at a URL they can open.
export const metadata = {
  title: 'SMS Consent & Opt-In | Sanctum',
  description:
    'How Sanctum collects consent to send one-time verification codes by text message, including the exact opt-in language shown to members.',
}

export default function SmsConsentPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="text-xl md:text-2xl font-bold text-foreground">Sanctum</span>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            SMS Consent &amp; Opt-In
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            How members agree to receive a text message from Sanctum.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Business identity -- addresses the name-match requirement. */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-3">Who sends these messages</h2>
            <p className="text-muted-foreground">
              Sanctum is a member check-in service for religious and cultural
              organizations, operated by <strong>Kedar Vyas</strong> (doing
              business as Sanctum). Text messages are sent by Sanctum to members
              of organizations that use the Sanctum mobile app.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-3">What we send</h2>
            <p className="text-muted-foreground mb-4">
              We send exactly one type of message: a <strong>one-time
              6-digit verification code</strong> used to sign in to the Sanctum
              mobile app.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>No marketing or promotional messages.</strong> Ever.</li>
              <li><strong>Message frequency:</strong> one message per sign-in attempt, so it varies with how often a member signs in.</li>
              <li><strong>Cost:</strong> message and data rates may apply, depending on the member&apos;s mobile carrier plan.</li>
              <li><strong>Opt out:</strong> reply STOP to any message to stop receiving texts. Reply HELP for assistance.</li>
            </ul>
            <div className="mt-4 p-4 rounded-lg bg-background border border-border">
              <p className="text-sm text-muted-foreground mb-1">Sample message:</p>
              <p className="font-mono text-sm text-foreground">
                Your Sanctum verification code is 123456.
              </p>
            </div>
          </div>

          {/* The opt-in workflow, step by step. */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">The complete opt-in workflow</h2>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">1</span>
                <span>A member downloads the Sanctum mobile app and enters the organization code given to them by their temple, church, mosque, gurdwara, or synagogue.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">2</span>
                <span>The member reaches the sign-in screen and types their mobile phone number.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">3</span>
                <span>
                  Directly below the phone number field, the member must tick an
                  <strong> unchecked consent checkbox</strong> agreeing to
                  receive the verification code by text message. The
                  &ldquo;Continue&rdquo; button stays disabled until it is
                  ticked. This consent is separate from, and not bundled with,
                  acceptance of our Privacy Policy or Terms of Service.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">4</span>
                <span>The member taps Continue. Only then do we send a single one-time verification code to the number provided.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">5</span>
                <span>The member enters the code to complete sign-in.</span>
              </li>
            </ol>
          </div>

          {/* Verbatim consent language. */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-3">Exact consent language shown to the member</h2>
            <p className="text-muted-foreground mb-4">
              This is the text displayed beside the consent checkbox on the
              sign-in screen, reproduced word for word:
            </p>
            <div className="p-5 rounded-lg bg-background border-2 border-primary/30">
              <div className="flex gap-3">
                <span className="flex-none w-5 h-5 rounded border-2 border-primary mt-0.5" aria-hidden="true" />
                <p className="text-foreground">
                  I agree to receive a one-time verification code by text message
                  from Sanctum at the number provided. This is the only text
                  message we send — no marketing or promotional messages.
                  Message frequency varies by sign-in. Message and data rates may
                  apply. Reply STOP to opt out or HELP for help.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              The Privacy Policy and Terms of Service links appear in a separate
              row below this checkbox, so that agreeing to receive messages is a
              distinct action from accepting those policies.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-3">How members opt out</h2>
            <p className="text-muted-foreground">
              Replying <strong>STOP</strong> to any message stops all further
              texts. Replying <strong>HELP</strong> returns support information.
              Because the verification code is how we authenticate members,
              opting out means a member can no longer sign in to the mobile app
              until they opt back in.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-3">How we handle phone numbers</h2>
            <p className="text-muted-foreground">
              Mobile information and phone numbers collected for text messaging
              are <strong>never sold, rented, or shared with third parties for
              marketing purposes</strong>. Phone numbers are shared only with our
              SMS delivery provider, for the sole purpose of transmitting the
              verification code.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/terms" className="text-primary underline underline-offset-4">
              Terms of Service
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/help" className="text-primary underline underline-offset-4">
              Help &amp; Support
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
