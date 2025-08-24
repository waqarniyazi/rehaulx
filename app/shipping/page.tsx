import { PolicyLayout } from "@/components/PolicyLayout"
import ShippingContent from "@/content/legal/shipping.mdx"

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Digital Service Delivery Policy" lastUpdated="August 24, 2025">
      <div className="prose prose-invert max-w-none">
        <ShippingContent />
      </div>
    </PolicyLayout>
  )
}
