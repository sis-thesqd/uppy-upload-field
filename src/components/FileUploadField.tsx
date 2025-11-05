'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import XHRUpload from '@uppy/xhr-upload';
import GoldenRetriever from '@uppy/golden-retriever';
import { Alert, AlertDescription } from './alert';
import { AlertCircle, ExternalLink, X } from 'lucide-react';
import { FileUploadConfig } from '../types';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

interface FileUploadFieldProps {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  config: FileUploadConfig;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  account?: number;
}

export function FileUploadField({
  id,
  value = [],
  onChange,
  config,
  required = false,
  disabled = false,
  error,
  touched,
  account
}: FileUploadFieldProps) {
  const uppyRef = useRef<Uppy | null>(null);
  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Use refs to avoid stale closures in Uppy event handlers
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const hasError = error && touched;
  const maxFiles = config.maxFiles || 10;
  const maxSizeMB = config.maxSizeMB || 1024 * 1024; // 1GB
  const acceptedTypes = useMemo(
    () => config.accept || ['image/*', 'video/*', '.pdf', '.doc', '.docx'],
    [config.accept]
  );

  useEffect(() => {
    // Initialize Uppy
    const uppy = new Uppy({
      id: `uppy-${id}`,
      autoProceed: false,
      debug: false,
      restrictions: {
        maxNumberOfFiles: maxFiles,
        maxFileSize: maxSizeMB * 1024 * 1024,
        allowedFileTypes: acceptedTypes.length > 0 ? acceptedTypes : undefined,
      },
    });

    // Add Dashboard plugin
    uppy.use(Dashboard, {
      inline: true,
      target: dashboardContainerRef.current!,
      height: 'auto',
      width: '100%',
      hideProgressDetails: false, // Show progress details (size, time remaining)
      proudlyDisplayPoweredByUppy: false,
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideCancelButton: false,
      showRemoveButtonAfterComplete: true,
      disableThumbnailGenerator: true, // Don't show image thumbnails
      note: config.helpText || undefined,
      theme: 'auto',
      locale: {
        strings: {
          dropPasteImportFiles: 'Drop files here, or browse',
        },
      },
    });

    // Add XHR Upload plugin
    uppy.use(XHRUpload, {
      endpoint: account ? `/api/upload?account=${account}` : '/api/upload',
      method: 'POST',
      formData: true,
      fieldName: 'file',
      timeout: 0,
      limit: 5,
      getResponseData(xhr) {
        try {
          const data = JSON.parse(xhr.responseText);
          return {
            url: data.url,
          };
        } catch {
          return { url: xhr.responseText };
        }
      },
    });

    // Add Golden Retriever for caching files across refreshes
    uppy.use(GoldenRetriever, {
      expires: 24 * 60 * 60 * 1000, // 24 hours
      serviceWorker: false, // Can be enabled later with service worker setup
    });

    // Handle successful uploads
    uppy.on('upload-success', (file, response) => {
      const uploadedUrl = response.body?.url || response.uploadURL;
      if (uploadedUrl && typeof uploadedUrl === 'string') {
        // Add URL to form state if not already present
        const currentValue = valueRef.current;
        if (!currentValue.includes(uploadedUrl)) {
          onChangeRef.current([...currentValue, uploadedUrl]);
        }
      }
    });

    // Handle file removal from Dashboard
    uppy.on('file-removed', (file) => {
      // If file was successfully uploaded, remove its URL from form state
      if (file.response?.body?.url) {
        const urlToRemove = file.response.body.url;
        const currentValue = valueRef.current;
        onChangeRef.current(currentValue.filter(url => url !== urlToRemove));
      }
    });

    // Handle complete event
    uppy.on('complete', (result) => {
      console.log('Upload complete:', {
        successful: result.successful?.length || 0,
        failed: result.failed?.length || 0,
      });
    });

    uppyRef.current = uppy;
    setMounted(true);

    return () => {
      uppy.destroy();
    };
  }, [id, maxFiles, maxSizeMB, acceptedTypes, account, config.helpText]);

  // Sync changes to value prop (for external updates)
  useEffect(() => {
    if (!uppyRef.current || !mounted) return;

    // This effect handles external changes to the value prop
    // (e.g., form reset or prepopulated values)
  }, [value, mounted]);

  return (
    <div className="space-y-2">
      {/* Uppy Dashboard Container */}
      <div
        ref={dashboardContainerRef}
        className="uppy-dashboard-container"
      />

      {/* Completed Files List (outside Dashboard) */}
      {value.length > 0 && (
        <div className="space-y-2 px-2">
          <div className="space-y-2">
            {value.map((url, index) => {
              const fileName = decodeURIComponent(url.split('/').pop() || `File ${index + 1}`);
              // Extract original filename from UUID-prefixed name
              const displayName = fileName.replace(/^[a-f0-9-]{36}-/i, '');

              return (
                <div
                  key={url}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">
                      {displayName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Open file in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onChange(value.filter(u => u !== url))}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      disabled={disabled}
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
