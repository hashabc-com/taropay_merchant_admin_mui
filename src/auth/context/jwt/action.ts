import { useAuthStore } from 'src/stores/auth-store';
import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';

// ----------------------------------------------------------------------

/** **************************************
 * Sign up — placeholder
 *************************************** */
export const signUp = async (_params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<void> => {
  // Not used in TaroPay admin
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    localStorage.removeItem('_token');
    localStorage.removeItem('_userInfo');
    localStorage.removeItem('_permissions');
    useCountryStore.getState().clearSelectedCountry();
    useMerchantStore.getState().clearSelectedMerchant();

    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      userInfo: null,
      permissions: null,
    });
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
