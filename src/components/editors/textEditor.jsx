import { useEditor, } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

import {
    // Basic
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditorProvider,
    RichTextField,
    // History
    MenuButtonUndo,
    MenuButtonRedo,
    // Formatting
    MenuButtonBold,
    MenuButtonItalic,
    MenuButtonUnderline,
    MenuButtonStrikethrough,
    MenuButtonRemoveFormatting,
    // Alignment
    MenuButtonAlignLeft,
    MenuButtonAlignCenter,
    MenuButtonAlignRight,
    MenuButtonAlignJustify,
    // Lists & Indent
    MenuButtonBulletedList,
    MenuButtonOrderedList,
    MenuButtonIndent,
    MenuButtonUnindent,
    // Elements
    MenuButtonBlockquote,
    MenuButtonCode,
    MenuButtonHorizontalRule,
    MenuButtonAddImage,
    // Extras
    LinkBubbleMenu,
    LinkBubbleMenuHandler
} from "mui-tiptap";

import { Box, Typography, FormHelperText } from "@mui/material";
import { useEffect } from "react";

export default function RichTextEditor({
    label,
    value,
    onChange,
    error,
    helperText,
    height = 300,
    readOnly = false
}) {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            // ============= FIX: Add LinkBubbleMenuHandler here =============
            LinkBubbleMenuHandler,
            // ================================================================
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value || "",
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange && onChange(html);
        }
    });

    // Sync external value → editor
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <Box sx={{ width: "100%" }}>
            {label && (
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    {label}
                </Typography>
            )}

            <RichTextEditorProvider editor={editor}>
                <RichTextField
                    controls={
                        !readOnly && (
                            <MenuControlsContainer>
                                {/* Group 1: History */}
                                <MenuButtonUndo />
                                <MenuButtonRedo />
                                <MenuDivider />

                                {/* Group 2: Headings */}
                                <MenuSelectHeading />
                                <MenuDivider />

                                {/* Group 3: Basic Formatting */}
                                <MenuButtonBold />
                                <MenuButtonItalic />
                                <MenuButtonUnderline />
                                <MenuButtonStrikethrough />
                                <MenuButtonCode />
                                <MenuButtonRemoveFormatting />
                                <MenuDivider />

                                {/* Group 4: Alignment */}
                                <MenuButtonAlignLeft />
                                <MenuButtonAlignCenter />
                                <MenuButtonAlignRight />
                                <MenuButtonAlignJustify />
                                <MenuDivider />

                                {/* Group 5: Lists */}
                                <MenuButtonBulletedList />
                                <MenuButtonOrderedList />
                                <MenuButtonIndent />
                                <MenuButtonUnindent />
                                <MenuDivider />

                                {/* Group 6: Special Inserts */}
                                <MenuButtonAddImage />
                                <MenuButtonBlockquote />
                                <MenuButtonHorizontalRule />
                            </MenuControlsContainer>
                        )
                    }
                    footer={
                        <>
                            {/* Shows a popup menu when you click a link */}
                            <LinkBubbleMenu />
                        </>
                    }
                    sx={{
                        minHeight: height,
                        border: error ? "1px solid #d32f2f" : "1px solid #c4c4c4",
                        borderRadius: 1,
                        "&:hover": {
                            borderColor: error ? "#d32f2f" : "black"
                        },
                        "& .MuiTiptap-RichTextField-menuContent": {
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            backgroundColor: "background.paper",
                        }
                    }}
                />
            </RichTextEditorProvider>

            {helperText && (
                <FormHelperText error={error}>
                    {helperText}
                </FormHelperText>
            )}
        </Box>
    );
}
