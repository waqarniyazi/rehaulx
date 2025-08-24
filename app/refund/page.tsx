import { PolicyLayout } from "@/components/PolicyLayout"
import RefundContent from "@/content/legal/refund.mdx"

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="Cancellation & Refund Policy" lastUpdated="August 24, 2025">
      <div className="prose prose-invert max-w-none">
        <RefundContent />
      </div>
    </PolicyLayout>
  )
}
