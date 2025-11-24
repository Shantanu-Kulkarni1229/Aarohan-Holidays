import React, { useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter text...', minHeight = '150px' }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isInitializedRef = useRef(false);
  const suppressChangeRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    const container = containerRef.current;
    
    // Create editor div
    const editorDiv = document.createElement('div');
    container.appendChild(editorDiv);

    // Initialize Quill
    quillRef.current = new Quill(editorDiv, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'header': [1, 2, 3, false] }],
          ['link'],
          ['clean']
        ]
      },
      formats: ['bold', 'italic', 'underline', 'list', 'header', 'link', 'bullet', 'ordered']
    });

    // Set initial content
    if (value) {
      const delta = quillRef.current.clipboard.convert(value);
      quillRef.current.setContents(delta, 'silent');
    }

    // Handle changes - only trigger onChange when user types
    quillRef.current.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user' && !suppressChangeRef.current) {
        const html = quillRef.current.root.innerHTML;
        onChange(html);
      }
    });

    isInitializedRef.current = true;

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
      if (container) {
        container.innerHTML = '';
      }
      quillRef.current = null;
      isInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update content when value changes externally (from form reset)
  useEffect(() => {
    if (quillRef.current && isInitializedRef.current) {
      const currentHtml = quillRef.current.root.innerHTML;
      const normalizedValue = value || '<p><br></p>';
      
      // Only update if content is actually different
      if (currentHtml !== normalizedValue && value !== currentHtml) {
        suppressChangeRef.current = true;
        const delta = quillRef.current.clipboard.convert(value || '');
        quillRef.current.setContents(delta, 'silent');
        suppressChangeRef.current = false;
      }
    }
  }, [value]);

  return (
    <div className="quill-editor-wrapper">
      <div ref={containerRef} style={{ minHeight }} />
      <style>{`
        .quill-editor-wrapper .ql-container {
          min-height: ${minHeight};
          font-size: 16px;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: ${minHeight};
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #9CA3AF;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
