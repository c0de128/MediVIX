import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Users, Calendar, Brain, FileText } from 'lucide-react'

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-8 w-8" />
                Patient Management
              </CardTitle>
              <CardDescription>
                Manage patient records, medical history, and personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patients">
                <Button size="lg" className="w-full text-base">View Patients</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Appointments
              </CardTitle>
              <CardDescription>
                Schedule and manage patient appointments with visit templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/appointments">
                <Button variant="outline" size="lg" className="w-full text-base">Manage Appointments</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-8 w-8" />
                AI Diagnosis
              </CardTitle>
              <CardDescription>
                Get AI-powered medical diagnosis assistance based on symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/diagnosis">
                <Button variant="secondary" size="lg" className="w-full text-base">Start Diagnosis</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Visit Templates
              </CardTitle>
              <CardDescription>
                Create and manage visit templates for different appointment types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/templates">
                <Button variant="outline" size="lg" className="w-full text-base">Manage Templates</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}