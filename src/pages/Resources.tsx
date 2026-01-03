import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { RESOURCE_TYPES, SUBJECTS } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  ExternalLink,
  FileText,
  Sparkles,
  Upload,
  X,
  File,
  Image,
  FileArchive,
  Share2,
  Check,
  Copy,
  Link2
} from "lucide-react";
import { validateFile as enhancedValidateFile } from "@/lib/fileValidation";
import { toast } from "sonner";
import { resourcesService, ResourceItem } from "@/services/resources.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ReportButton } from "@/components/ReportButton";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileText className="h-5 w-5 text-purple-500" />;
  if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />;
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="h-5 w-5 text-yellow-500" />;
  return <File className="h-5 w-5 text-blue-500" />;
};

const Resources = () => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareResource, setShareResource] = useState<ResourceItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [justUploaded, setJustUploaded] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "notes",
    link: "",
  });

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Get user role for permissions
  const { user } = useAppContext();
  const canUpload = user && (user.role === 'user' || user.role === 'admin');

  // Pagination state
  const [itemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await resourcesService.getAll();
        setResources(data);
      } catch (error) {
        console.error(error);
        // Don't show error in mock mode
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFileSelect = (file: File) => {
    // Use enhanced validation
    const validation = enhancedValidateFile(file);

    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    if (!form.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setForm({ ...form, title: nameWithoutExt });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openShareDialog = (resource: ResourceItem) => {
    setShareResource(resource);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const copyShareLink = async () => {
    if (shareResource) {
      await resourcesService.copyShareLink(shareResource);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addResource = async () => {
    if (!form.title || !form.subject) {
      toast.error("Please fill in title and subject");
      return;
    }

    if (!selectedFile && !form.link) {
      toast.error("Please upload a file or provide a link");
      return;
    }

    // Check for duplicates
    try {
      const duplicate = await resourcesService.checkDuplicate(form.title, form.subject);

      if (duplicate) {
        const confirmed = window.confirm(
          `A similar resource titled "${duplicate.title}" already exists in ${duplicate.subject}.\n\n` +
          `Created: ${new Date(duplicate.createdAt).toLocaleDateString()}\n` +
          `Downloads: ${duplicate.downloads}\n\n` +
          `Do you want to upload this resource anyway?`
        );

        if (!confirmed) {
          toast.info("Upload cancelled");
          return;
        }
      }
    } catch (error) {
      console.error('Duplicate check failed:', error);
      // Continue with upload even if duplicate check fails
    }

    setUploading(true);
    setProgress(0);

    try {
      let fileData = null;

      if (selectedFile) {
        fileData = await resourcesService.uploadFile(selectedFile, (prog) => {
          setProgress(prog);
        });
      }

      const newResource = await resourcesService.create({
        title: form.title,
        description: form.description,
        subject: form.subject,
        type: form.type,
        link: form.link,
        ...(fileData && {
          fileUrl: fileData.fileUrl,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileType: fileData.fileType,
        }),
      });

      setResources([newResource, ...resources]);
      setForm({ title: "", description: "", subject: "", type: "notes", link: "" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Mark as just uploaded and show share dialog
      setJustUploaded(newResource.id);
      setShareResource(newResource);
      setShareDialogOpen(true);

      toast.success("Resource shared successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to share resource");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDownload = async (resource: ResourceItem) => {
    if (resource.fileUrl) {
      try {
        const data = await resourcesService.triggerDownload(resource.id);
        setResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, downloads: data.downloads } : r))
        );
        toast.success("Download started!");
      } catch (error) {
        toast.error("Failed to download file");
      }
    } else if (resource.link) {
      window.open(resource.link, "_blank");
    }
  };

  const rateResource = async (id: string, rating: number) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, average_rating: rating } : r))
    );
    await resourcesService.rate(id, rating);
  };

  // Filter and search resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = filterSubject === "all" || resource.subject === filterSubject;
    const matchesType = filterType === "all" || resource.type === filterType;

    return matchesSearch && matchesSubject && matchesType;
  });

  // Paginate filtered resources
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(0, currentPage * itemsPerPage);
  const hasMore = currentPage < totalPages;

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterSubject("all");
    setFilterType("all");
    setCurrentPage(1); // Reset to first page
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSubject, filterType]);

  return (
    <PageTransition className="container mx-auto px-4 py-10 space-y-10 max-w-5xl">
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-500" />
              {justUploaded === shareResource?.id ? "Resource Uploaded!" : "Share Resource"}
            </DialogTitle>
            <DialogDescription>
              {justUploaded === shareResource?.id
                ? "Your resource has been shared successfully. Copy the link below to share it with others."
                : "Share this resource with your peers."
              }
            </DialogDescription>
          </DialogHeader>

          {shareResource && (
            <div className="space-y-4">
              {/* Resource Preview */}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                {getFileIcon(shareResource.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{shareResource.title}</p>
                  <p className="text-sm text-muted-foreground">{shareResource.subject}</p>
                </div>
              </div>

              {/* Share Link */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">
                    {resourcesService.getShareUrl(shareResource)}
                  </span>
                </div>
                <Button
                  onClick={copyShareLink}
                  variant="default"
                  className="shrink-0 bg-purple-600 hover:bg-purple-700"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 mr-2" /> Copied!</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copy</>
                  )}
                </Button>
              </div>

              {/* Quick Share Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = resourcesService.getShareUrl(shareResource);
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this resource: ${shareResource.title}\n${url}`)}`, '_blank');
                  }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = resourcesService.getShareUrl(shareResource);
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this resource: ${shareResource.title}`)}&url=${encodeURIComponent(url)}`, '_blank');
                  }}
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = resourcesService.getShareUrl(shareResource);
                    window.open(`mailto:?subject=${encodeURIComponent(shareResource.title)}&body=${encodeURIComponent(`Check out this resource:\n${url}`)}`, '_blank');
                  }}
                >
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Form - Only for authenticated users */}
      {canUpload ? (
        <Card className="p-8 border-t-4 border-t-purple-500 shadow-lg relative overflow-hidden bg-background/60 backdrop-blur-md">
          {uploading && (
            <motion.div
              className="absolute top-0 left-0 h-1 bg-purple-500 z-50"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6 text-purple-500" />
              Share Resource
            </h2>
            {uploading && (
              <span className="text-sm font-medium text-purple-600 animate-pulse">
                Uploading... {progress}%
              </span>
            )}
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 mb-6 text-center transition-all cursor-pointer
            ${dragActive ? "border-purple-500 bg-purple-500/10" : "border-muted-foreground/30 hover:border-purple-400"}
            ${selectedFile ? "border-green-500 bg-green-500/10" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp"
              disabled={uploading}
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-4">
                {getFileIcon(selectedFile.type)}
                <div className="text-left">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedFile();
                  }}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-1">
                  <span className="font-medium text-purple-500">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Images, Word, PowerPoint, ZIP (Max 50MB)
                </p>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Resource Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={uploading}
            />

            <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Link (optional if file uploaded)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              disabled={uploading}
            />
          </div>

          <Textarea
            className="mt-4"
            placeholder="What makes this resource useful?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={uploading}
          />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={addResource}
              disabled={uploading || !form.title || !form.subject || (!selectedFile && !form.link)}
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700"
            >
              {uploading ? "Uploading..." : "Share Resource"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 border-t-4 border-t-amber-500 bg-background/60 backdrop-blur-md">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sign in to Share Resources</h3>
            <p className="text-muted-foreground mb-4">
              Only registered users can upload and share resources with the community.
            </p>
            <Button
              onClick={() => window.location.href = '/auth'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Sign In / Register
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-6 bg-background/60 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="🔍 Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RESOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || filterSubject !== "all" || filterType !== "all") && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Showing {Math.min(paginatedResources.length, filteredResources.length)} of {filteredResources.length} resources
        </p>
      </Card>

      {/* Resource Feed */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 h-full bg-background/40 backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))
          ) : (
            paginatedResources.map((r) => (
              <motion.div
                key={r.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 },
                }}
                layout
                whileHover={{ y: -5 }}
              >
                <Card className={`p-6 h-full flex flex-col justify-between hover:shadow-lg transition-all border-l-4 bg-background/40 backdrop-blur-md
                  ${justUploaded === r.id ? "border-l-green-500 ring-2 ring-green-500/30" : "border-l-transparent hover:border-l-purple-400"}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg">
                          {getFileIcon(r.fileType)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold line-clamp-1">{r.title}</h3>
                          {r.fileName && (
                            <p className="text-xs text-muted-foreground">
                              {r.fileName} {r.fileSize && `• ${formatFileSize(r.fileSize)}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                        {r.subject}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{r.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-t pt-4">
                      <div className="flex items-center gap-2">
                        {r.fileUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(r)}
                            className="text-purple-600 gap-1 hover:text-purple-700 p-0 h-auto"
                          >
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        ) : r.link ? (
                          <a
                            href={r.link}
                            target="_blank"
                            className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        ) : null}

                        {/* Share Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openShareDialog(r)}
                          className="text-muted-foreground gap-1 hover:text-purple-600 p-0 h-auto ml-3"
                        >
                          <Share2 className="h-4 w-4" /> Share
                        </Button>

                        {/* Bookmark Button */}
                        <BookmarkButton resourceId={r.id} />

                        {/* Report Button */}
                        <ReportButton type="resource" targetId={r.id} />
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Download className="h-3 w-3" /> {r.downloads}
                      </div>
                    </div>

                    {/* Interactive Rating */}
                    <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                      <span className="text-xs font-medium">Rate:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className={`cursor-pointer ${r.average_rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                            onClick={() => rateResource(r.id, star)}
                          >
                            <Sparkles className={`h-4 w-4 ${r.average_rating >= star ? "fill-current" : ""}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {hasMore && paginatedResources.length > 0 && !loading && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Load More Resources
          </Button>
        </div>
      )}

      {filteredResources.length === 0 && !uploading && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
          {resources.length === 0 ? (
            <>
              <p className="text-lg font-medium">No resources shared yet</p>
              <p className="text-sm">Be the first to share a resource with your peers!</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No resources found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </>
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default Resources;
