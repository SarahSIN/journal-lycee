import Navbar from '@/components/layout/Navbar'

export default function WebsiteLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 flex-grow">
        {children}
      </div>
    </>
  )
}