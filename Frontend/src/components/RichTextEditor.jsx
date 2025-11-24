import React, { useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter text...', minHeight = '150px' }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isInitializedRef = useRef(false);

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
      formats: ['bold', 'italic', 'underline', 'list', 'header', 'link']
    });

    // Set initial content
    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    // Handle changes
    quillRef.current.on('text-change', () => {
      const html = quillRef.current.root.innerHTML;
      onChange(html);
    });

    isInitializedRef.current = true;

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      quillRef.current = null;
      isInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update content when value changes externally
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || '';
      if (selection) {
        quillRef.current.setSelection(selection);
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
