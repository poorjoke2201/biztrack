// src/pages/ProfilePage/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProfilePage.module.css'; // Create this CSS module
import { useAuth } from '../../hooks/useAuth'; // To get initial user data and update context
import { getProfile, updateMyProfile } from '../../services/userService'; // Fetch profile and update self
// TODO: Import password change service when available
// import { changePassword } from '../../services/authService';

// Import Components (Adjust paths as needed)
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Card from '../../components/Card/Card'; // Assuming a Card component for layout
// TODO: Import Modal component for password change
// import Modal from '../../components/Modal/Modal';
// TODO: Import PasswordChangeForm component
// import PasswordChangeForm from '../../components/auth/PasswordChangeForm';

const ProfilePage = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth(); // Get user from context and setter

  // State for editable fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Usually not editable, display only
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState(''); // Display only
  const [memberSince, setMemberSince] = useState(''); // Display only

  // UI/Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Loading profile data
  const [submitting, setSubmitting] = useState(false); // Submitting profile updates
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // TODO: State for password change modal
  // const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Fetch profile data on mount
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess(''); // Clear messages on fetch
    console.log("ProfilePage: Fetching profile...");
    try {
      const profileData = await getProfile();
      if (profileData) {
        console.log("ProfilePage: Profile data fetched:", profileData);
        setName(profileData.name || '');
        setEmail(profileData.email || ''); // Display fetched email
        setPhoneNumber(profileData.phoneNumber || '');
        setRole(profileData.role || '');
        // Format createdAt date if available
        setMemberSince(profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A');
        // Update auth context if fetched data differs (e.g., role updated elsewhere)
        // Be cautious with this to avoid infinite loops if context isn't memoized well
        // setAuthUser(profileData);
      } else {
          throw new Error("No profile data returned.");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile details.");
      // Maybe logout if profile fetch fails completely? Depends on AuthContext handling
    } finally {
      setLoading(false);
    }
  }, []); // Removed setAuthUser dependency to prevent potential loops, fetch only on mount

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Fetch profile when component mounts

  const handleEditToggle = () => {
    if (isEditing) {
        // If cancelling edit, reset fields to original fetched values
        fetchProfile(); // Refetch to discard changes
    }
    setIsEditing(!isEditing);
    setError(''); // Clear errors when toggling edit mode
    setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const updatedData = {
        name: name,
        // Only include phone if it has a value, otherwise backend might clear it
        phoneNumber: phoneNumber || undefined
        // Do not send email, role, password here
    };

    console.log("Updating profile with:", updatedData);

    try {
        // Use updateMyProfile which should hit PUT /api/users/profile or similar
        const updatedUser = await updateMyProfile(updatedData);
        setSuccess("Profile updated successfully!");
        setIsEditing(false); // Exit edit mode
        // Update local state with response data
        setName(updatedUser.name || '');
        setPhoneNumber(updatedUser.phoneNumber || '');
        // Update the user state in AuthContext
        setAuthUser(prevUser => ({ ...prevUser, name: updatedUser.name, phoneNumber: updatedUser.phoneNumber }));

    } catch (err) {
        console.error("Error updating profile:", err);
        setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
        setSubmitting(false);
    }
  };

  // TODO: Handlers for password change modal
  // const openPasswordModal = () => setIsPasswordModalOpen(true);
  // const closePasswordModal = () => setIsPasswordModalOpen(false);
  // const handlePasswordChangeSuccess = () => {
  //     setSuccess("Password changed successfully!");
  //     closePasswordModal();
  // };

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <h2>Your Profile</h2>
        <Spinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <h2>Your Profile</h2>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')}/>}

      <Card className={styles.profileCard}>
        <form onSubmit={handleProfileUpdate}>
          {/* --- User Avatar/Icon (Placeholder) --- */}
          <div className={styles.profileHeader}>
             <div className={styles.avatarPlaceholder}>👤</div> {/* Replace with actual avatar/icon */}
             <div className={styles.userInfo}>
                 {/* Display Email (Non-editable) */}
                 <p className={styles.userEmail}>{email}</p>
                 <p className={styles.userRole}>Role: {role}</p>
             </div>
             {!isEditing && (
                 <Button onClick={handleEditToggle} variant="outline" size="small" className={styles.editButton}>
                     Edit Profile
                 </Button>
             )}
          </div>

          {/* --- Account Information --- */}
          <h3 className={styles.sectionTitle}>Account Information</h3>
          <div className={styles.infoGrid}>
             <InputField
                label="Full Name"
                id="profileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing || submitting}
                readOnly={!isEditing}
                required
             />
             {/* Email is typically not editable after registration */}
              <InputField
                label="Email Address"
                id="profileEmail"
                type="email"
                value={email}
                readOnly // Make email read-only
                disabled
              />
             <InputField
                label="Phone Number"
                id="profilePhone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing || submitting}
                readOnly={!isEditing}
                placeholder="e.g., 123-456-7890"
             />
             <InputField
                label="Member Since"
                id="profileMemberSince"
                value={memberSince}
                readOnly
                disabled
             />
          </div>

          {/* --- Edit/Save Buttons --- */}
           {isEditing && (
               <div className={styles.editActions}>
                    <Button type="submit" disabled={submitting} variant="primary">
                       {submitting ? <Spinner size="small" /> : 'Save Changes'}
                    </Button>
                    <Button type="button" onClick={handleEditToggle} variant="secondary" disabled={submitting}>
                        Cancel
                    </Button>
               </div>
           )}

          {/* --- Security Section --- */}
           {!isEditing && ( // Show only when not editing profile details
                <>
                    <h3 className={styles.sectionTitle}>Security</h3>
                    <Button
                        type="button"
                        onClick={() => alert("Password change UI TBD")} // Replace with openPasswordModal
                        variant="outline"
                        >
                        Change Password
                    </Button>
                </>
           )}
        </form>
      </Card>

      {/* TODO: Password Change Modal */}
      {/*
      <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} title="Change Password">
          <PasswordChangeForm onSuccess={handlePasswordChangeSuccess} onCancel={closePasswordModal} />
      </Modal>
      */}
    </div>
  );
};

export default ProfilePage;