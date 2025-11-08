import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Download, Share2, Search, Calendar, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  courseTitle: string;
  instructor: string;
  completedDate: string;
  certificateNumber: string;
  grade: string;
  score: number;
  hours: number;
  skills: string[];
}

const certificates: Certificate[] = [
  {
    id: '1',
    courseTitle: 'UI/UX Design Principles',
    instructor: 'Sarah Teacher',
    completedDate: '2024-03-15',
    certificateNumber: 'CERT-2024-001234',
    grade: 'A',
    score: 94,
    hours: 6,
    skills: ['UI Design', 'UX Research', 'Prototyping', 'Figma'],
  },
  {
    id: '2',
    courseTitle: 'Web Development Fundamentals',
    instructor: 'Sarah Teacher',
    completedDate: '2024-02-28',
    certificateNumber: 'CERT-2024-001189',
    grade: 'A-',
    score: 88,
    hours: 8,
    skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
  },
];

export default function Certificates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const filteredCertificates = certificates.filter((cert) =>
    cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (cert: Certificate) => {
    toast.success(`Downloading certificate for ${cert.courseTitle}`);
  };

  const handleShare = (cert: Certificate) => {
    navigator.clipboard.writeText(
      `I just earned a certificate in ${cert.courseTitle}! Certificate #${cert.certificateNumber}`
    );
    toast.success('Certificate link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Certificates</h1>
            <p className="text-muted-foreground mt-1">
              View and download your earned certificates
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{certificates.length}</p>
            <p className="text-sm text-muted-foreground">Certificates Earned</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Total Certificates
              </CardDescription>
              <CardTitle className="text-3xl">{certificates.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Avg Score
              </CardDescription>
              <CardTitle className="text-3xl">
                {Math.round(certificates.reduce((sum, c) => sum + c.score, 0) / certificates.length)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Year
              </CardDescription>
              <CardTitle className="text-3xl">{certificates.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Learning Hours
              </CardDescription>
              <CardTitle className="text-3xl">
                {certificates.reduce((sum, c) => sum + c.hours, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCertificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in"
                onClick={() => setSelectedCertificate(certificate)}
              >
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <Award className="h-12 w-12 text-primary" />
                    <Badge variant="secondary" className="text-lg font-bold">
                      {certificate.grade}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{certificate.courseTitle}</h3>
                  <p className="text-sm text-muted-foreground">by {certificate.instructor}</p>
                </div>

                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Completed</p>
                      <p className="font-medium">
                        {new Date(certificate.completedDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Score</p>
                      <p className="font-medium">{certificate.score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium">{certificate.hours} hours</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Certificate #</p>
                      <p className="font-mono text-xs">{certificate.certificateNumber}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills Earned</p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(certificate);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(certificate);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete courses to earn your first certificate
              </p>
            </CardContent>
          </Card>
        )}

        {/* Certificate Preview Dialog */}
        <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            {selectedCertificate && (
              <div className="space-y-6">
                {/* Certificate Design */}
                <div className="border-8 border-primary/20 rounded-lg p-12 bg-gradient-to-br from-background via-primary/5 to-background">
                  <div className="text-center space-y-6">
                    <Award className="h-20 w-20 mx-auto text-primary" />
                    
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                        Certificate of Completion
                      </p>
                      <h2 className="text-4xl font-bold mb-4">EduLearn</h2>
                    </div>

                    <div className="py-6">
                      <p className="text-muted-foreground mb-2">This certifies that</p>
                      <p className="text-3xl font-bold mb-4">Student Name</p>
                      <p className="text-muted-foreground mb-2">has successfully completed</p>
                      <p className="text-2xl font-semibold mb-4">{selectedCertificate.courseTitle}</p>
                      <p className="text-muted-foreground">
                        Instructor: {selectedCertificate.instructor}
                      </p>
                    </div>

                    <div className="flex justify-center gap-12 pt-6 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Date</p>
                        <p className="font-medium">
                          {new Date(selectedCertificate.completedDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Grade</p>
                        <p className="font-bold text-2xl">{selectedCertificate.grade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Score</p>
                        <p className="font-medium">{selectedCertificate.score}%</p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <p className="text-xs text-muted-foreground font-mono">
                        Certificate Number: {selectedCertificate.certificateNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleDownload(selectedCertificate)}
                  >
                    <Download className="h-4 w-4" />
                    Download as PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleShare(selectedCertificate)}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Certificate
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
