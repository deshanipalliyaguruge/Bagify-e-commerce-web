import Link from 'next/link'
import { PackageX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/config/app'

export default function ProductNotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <PackageX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Product not found</h1>
      <p className="max-w-md text-muted-foreground">
        This product may have been removed or the link is incorrect.
      </p>
      <Link href={ROUTES.shop} className={buttonVariants({ variant: 'default' })}>
        Browse all products
      </Link>
    </div>
  )
}
