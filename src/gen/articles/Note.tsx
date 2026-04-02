import { ComponentChildren } from 'preact';

function Note() { return null; };

function NoteRef({ noteId }: { noteId: number }) {
  return (
    <sup>[<a href={'#note-' + noteId}>{noteId}</a>]</sup>
  );
};

function NoteContent({ noteId, children }: { noteId: number, children: ComponentChildren }) {
  return (
    <aside class="note" id={'note-' + noteId}>
      {noteId}. {children}
    </aside>
  );
};

Note.Ref = NoteRef;
Note.Content = NoteContent;

export { Note };
