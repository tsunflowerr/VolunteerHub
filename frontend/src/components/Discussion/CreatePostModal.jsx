import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Video, Smile, MapPin, Tag, Loader2 } from 'lucide-react';
import styles from './CreatePostModal.module.css';

const CreatePostModal = ({ onClose, onSubmit, userAvatar, userName }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: Upload images to server and get URLs
    const imageUrls = images.map((img) => img.preview);

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      image: imageUrls,
    });

    setIsSubmitting(false);
  };

  // Auto-resize textarea
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const isValid = title.trim() && content.trim();

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Create Post</h2>
          <motion.button
            className={styles.closeBtn}
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          <img src={userAvatar} alt={userName} className={styles.avatar} />
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.visibility}>🌍 Public</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <input
            type="text"
            placeholder="Title of your post..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.titleInput}
            maxLength={100}
          />

          <textarea
            ref={textareaRef}
            placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
            value={content}
            onChange={handleContentChange}
            className={styles.textarea}
            rows={4}
          />

          {/* Image Preview */}
          {images.length > 0 && (
            <div className={styles.imagePreview}>
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  className={styles.previewItem}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <img src={image.preview} alt={`Upload ${index + 1}`} />
                  <button
                    className={styles.removeImage}
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
              <motion.button
                className={styles.addMoreImages}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image size={24} />
                <span>Add Photos</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Add to Post */}
        <div className={styles.addToPost}>
          <span className={styles.addToPostLabel}>Add to your post</span>
          <div className={styles.addToPostActions}>
            <motion.button
              className={styles.addAction}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Add Photo/Video"
            >
              <Image size={24} color="#4CAF50" />
            </motion.button>
            <motion.button
              className={styles.addAction}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Add Video"
            >
              <Video size={24} color="#F44336" />
            </motion.button>
            <motion.button
              className={styles.addAction}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Add Emoji"
            >
              <Smile size={24} color="#FFC107" />
            </motion.button>
            <motion.button
              className={styles.addAction}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Check In"
            >
              <MapPin size={24} color="#F44336" />
            </motion.button>
            <motion.button
              className={styles.addAction}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Tag People"
            >
              <Tag size={24} color="#2196F3" />
            </motion.button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*,video/*"
          multiple
          hidden
        />

        {/* Submit Button */}
        <motion.button
          className={`${styles.submitBtn} ${!isValid ? styles.disabled : ''}`}
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;
