<template>
  <v-menu
    :close-on-content-click="false"
    left
    offset-y
  >
    <template v-slot:activator="{ on: menu }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn
            icon
            v-on="{ ...tooltip, ...menu }"
          >
            <v-avatar
              class="elevation-4"
              :size="avatarSize"
            >
              <v-img :src="$store.state.userAuth.photoURL" />
            </v-avatar>
          </v-btn>
        </template>
        <span
          v-text="($store.state.userData && $store.state.userData.name)
            ? $store.state.userData.name
            : $store.state.userAuth.displayName"
        />
      </v-tooltip>
    </template>
    <v-list :dense="$vuetify.breakpoint.smAndDown">
      <v-list-item
        @click="changeDisplayNameDialogVisible = true"
      >
        <v-list-item-icon>
          <v-icon>mdi-account-edit</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-t="'change-display-name'" />
      </v-list-item>
      <v-list-item
        v-if="!addedProviders.includes('google.com')"
        :disabled="googleLoading"
        @click="linkGoogle"
      >
        <v-list-item-icon>
          <v-progress-circular
            v-if="googleLoading"
            indeterminate
            :size="24"
          />
          <v-icon v-else>
            mdi-google
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title v-t="'link-google'" />
      </v-list-item>
      <v-list-item
        v-if="!addedProviders.includes('facebook.com')"
        :disabled="facebookLoading"
        @click="linkFacebook"
      >
        <v-list-item-icon>
          <v-progress-circular
            v-if="facebookLoading"
            indeterminate
            :size="24"
          />
          <v-icon v-else>
            mdi-facebook
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title v-t="'link-facebook'" />
      </v-list-item>
      <v-list-item
        v-if="addedProviders.includes('facebook.com')"
        :disabled="addedProviders.length === 1"
        @click="facebookUnlinkDialogVisible = true"
      >
        <v-list-item-icon>
          <v-icon>
            mdi-facebook
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title v-t="'unlink-facebook'" />
      </v-list-item>
      <v-list-item @click="signOut">
        <v-list-item-icon>
          <v-icon>mdi-logout-variant</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-t="'sign-out'" />
      </v-list-item>
    </v-list>
    <change-display-name-dialog v-model="changeDisplayNameDialogVisible" />
    <facebook-unlink-dialog v-model="facebookUnlinkDialogVisible" />
  </v-menu>
</template>

<script>
  import ChangeDisplayNameDialog from './ChangeDisplayNameDialog.vue';
  import FacebookUnlinkDialog from './FacebookUnlinkDialog.vue';

  export default {
    components: {
      ChangeDisplayNameDialog,
      FacebookUnlinkDialog,
    },
    data: () => ({
      changeDisplayNameDialogVisible: false,
      facebookUnlinkDialogVisible: false,
      googleLoading: false,
      facebookLoading: false,
    }),
    computed: {
      addedProviders () {
        if (!this.$store.state.userAuth) return [];
        return this.$store.state.userAuth.providerData.map((provider) => provider.providerId);
      },
      avatarSize () {
        if (this.$vuetify.breakpoint.smOnly) return 40;
        if (this.$vuetify.breakpoint.xsOnly) return 32;
        return 48;
      },
    },
    methods: {
      async linkGoogle () {
        this.googleLoading = true;

        try {
          await this.$auth.linkGoogle();
        } catch (error) {
          this.$toast.error(this.$t('toasts.link-failed'));
          console.error(error);
        }

        this.googleLoading = false;
      },
      async linkFacebook () {
        this.facebookLoading = true;

        try {
          await this.$auth.linkFacebook();
        } catch (error) {
          this.$toast.error(this.$t('toasts.link-failed'));
          console.error(error);
        }

        this.facebookLoading = false;
      },
      async signOut () {
        await this.$auth.signOut();
        this.$toast(this.$t('toasts.signed-out'));
      },
    },
  };
</script>
