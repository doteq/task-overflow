<template>
  <v-container
    v-touch="{
      left: () => dateNext(),
      right: () => datePrevious(),
    }"
    class="board-container"
    :class="{
      'fill-height': (boardInfoLoaded && !boardInfo) || canViewBoard === false,
      'min-fill-height': $vuetify.breakpoint.smAndDown
    }"
  >
    <app-bar
      back-to="/"
      :title-loading="!boardInfoLoaded"
    >
      {{ boardInfo ? boardInfo.name : $t('board-not-found-message') }}
      <template
        v-if="userIsMember"
        v-slot:buttons
      >
        <board-menu
          v-if="$vuetify.breakpoint.smAndDown"
          dense
          :join-requests="joinRequests"
          :user-is-owner="userIsOwner"
        >
          <template v-slot:activator="{ on: menuOn, badgeCount, value }">
            <div>
              <v-tooltip v-if="$vuetify.breakpoint.xsOnly">
                <template v-slot:activator="{ on: tooltipOn }">
                  <v-btn
                    icon
                    v-on="{ ...menuOn, ...tooltipOn }"
                  >
                    <v-badge
                      :value="badgeCount > 0 && !value"
                      color="red"
                      :content="badgeCount"
                      overlap
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-badge>
                  </v-btn>
                </template>
                <span v-text="$t('board-menu')" />
              </v-tooltip>
              <v-btn
                v-else
                text
                v-on="menuOn"
              >
                <v-icon left>
                  mdi-dots-vertical
                </v-icon>
                <v-badge
                  v-t="'board-menu'"
                  :value="badgeCount > 0 && !value"
                  color="red"
                  :content="badgeCount"
                />
              </v-btn>
            </div>
          </template>
        </board-menu>
      </template>
      <template
        v-if="$vuetify.breakpoint.xsOnly"
        v-slot:extension
      >
        <div class="grow">
          <div
            class="d-flex align-center"
          >
            <v-btn
              icon
              @click="datePrevious"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <div
              class="text-center body-1 mx-1 grow"
              v-text="dateString"
            />
            <v-btn
              icon
              @click="dateNext"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-dialog v-model="calendarDialogVisible">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                >
                  <v-icon>mdi-calendar</v-icon>
                </v-btn>
              </template>
              <v-date-picker
                v-model="date"
                full-width
                :events="calendarEventColor"
                :first-day-of-week="$t('first-day-of-week')"
                color="secondary"
              >
                <v-spacer />
                <v-btn
                  v-t="'close'"
                  text
                  @click="calendarDialogVisible = false"
                />
              </v-date-picker>
            </v-dialog>
          </div>
        </div>
      </template>
    </app-bar>
    <div
      v-if="boardInfoLoaded && !boardInfo"
      class="d-flex fill-height flex-column align-center justify-center grow"
    >
      <h1
        class="display-1"
        v-text="$t('board-not-found-message')"
      />
    </div>
    <div
      v-else-if="canViewBoard === false"
      class="d-flex fill-height fill-width flex-column align-center justify-center grow"
    >
      <h1
        class="display-1 text-center"
        v-text="$t('board-is-private-message')"
      />
      <v-btn
        v-if="!$store.state.userAuth"
        v-t="'sign-in'"
        color="primary black--text"
        class="mt-8"
        large
        @click="showSignInSheet"
      />
      <v-skeleton-loader
        v-else-if="!selfMemberRequestLoaded"
        type="image"
        width="200px"
        height="44px"
        class="mt-8"
      />
      <div
        v-else-if="selfMemberRequest"
        class="mt-8 body-1 text-center text--secondary"
        v-text="$t('join-request-pending-message')"
      />
      <v-btn
        v-else
        v-t="'ask-to-join'"
        color="primary black--text"
        class="mt-8"
        large
        @click="requestPermission"
      />
    </div>
    <template v-else>
      <v-row v-if="$vuetify.breakpoint.mdAndUp">
        <v-col class="shrink">
          <template v-if="!boardInfoLoaded || !$store.state.userAuthLoaded">
            <v-skeleton-loader
              type="image"
              width="100%"
              height="44px"
              class="mb-4"
            />
            <v-skeleton-loader
              type="image"
              width="100%"
              height="36px"
              class="mb-4"
            />
          </template>
          <template v-else-if="userIsMember">
            <v-menu
              offset-y
              bottom
              :nudge-bottom="8"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  block
                  color="secondary"
                  class="mb-4"
                  large
                  v-on="on"
                >
                  <v-icon left>
                    mdi-plus
                  </v-icon>
                  <v-spacer />
                  {{ $t('add-new-event') }}
                  <v-spacer />
                </v-btn>
              </template>
              <event-type-select-menu-list />
            </v-menu>
            <board-menu
              :join-requests="joinRequests"
              :user-is-owner="userIsOwner"
            >
              <template v-slot:activator="{ on, badgeCount, value }">
                <v-badge
                  :value="badgeCount > 0 && !value"
                  bordered
                  color="red"
                  :content="badgeCount"
                  overlap
                  class="d-block"
                >
                  <v-btn
                    block
                    class="mb-4"
                    outlined
                    v-on="on"
                  >
                    <v-icon left>
                      mdi-dots-vertical
                    </v-icon>
                    <v-spacer />
                    {{ $t('board-menu') }}
                    <v-spacer />
                  </v-btn>
                </v-badge>
              </template>
            </board-menu>
          </template>
          <v-card
            v-else
            outlined
            class="pa-4 mb-4"
          >
            <h2
              class="subtitle-1 text-center mb-4"
              v-text="$t('not-a-board-member-message')"
            />
            <v-btn
              v-if="!$store.state.userAuth"
              v-t="'sign-in'"
              block
              color="primary black--text"
              large
              @click="showSignInSheet"
            />
            <v-skeleton-loader
              v-else-if="!selfMemberRequestLoaded"
              type="image"
              width="100%"
              height="44px"
            />
            <div
              v-else-if="selfMemberRequest"
              class="body-2 text-center text--secondary"
              v-text="$t('join-request-pending-message')"
            />
            <v-btn
              v-else
              v-t="'ask-to-join'"
              block
              color="primary black--text"
              large
              @click="requestPermission"
            />
          </v-card>
          <v-date-picker
            v-model="date"
            no-title
            :events="calendarEventColor"
            :first-day-of-week="$t('first-day-of-week')"
            color="secondary"
          />
        </v-col>
        <v-col class="overflow-x-hidden">
          <event-list
            :loading="eventListLoading"
            :events="currentEvents"
            :done-homework="doneHomework"
            :date="date"
          />
        </v-col>
      </v-row>
      <div
        v-else
        class="d-flex flex-column"
      >
        <v-card
          v-if="boardInfoLoaded && !userIsMember"
          outlined
          class="pa-3 mb-3"
          :class="{
            'pa-3': $vuetify.breakpoint.xsOnly,
            'pa-4': $vuetify.breakpoint.smAndUp
          }"
        >
          <h2
            class="text-center mb-4 subtitle-1"
            v-text="$t('not-a-board-member-message')"
          />
          <v-btn
            v-if="!$store.state.userAuth"
            v-t="'sign-in'"
            block
            color="primary black--text"
            @click="showSignInSheet"
          />
          <v-skeleton-loader
            v-else-if="!selfMemberRequestLoaded"
            type="image"
            width="100%"
            height="44px"
          />
          <div
            v-else-if="selfMemberRequest"
            class="body-2 text-center text--secondary"
            v-text="$t('join-request-pending-message')"
          />
          <v-btn
            v-else
            v-t="'ask-to-join'"
            block
            color="primary black--text"
            @click="requestPermission"
          />
        </v-card>

        <v-date-picker
          v-if="$vuetify.breakpoint.smOnly"
          v-model="date"
          full-width
          landscape
          class="mb-6"
          :events="calendarEventColor"
          color="secondary"
        />
        <event-list
          :loading="eventListLoading"
          :events="currentEvents"
          :done-homework="doneHomework"
          :date="date"
        />
      </div>
      <!--      <v-btn-->
      <!--        v-if="$vuetify.breakpoint.smAndDown && userIsMember"-->
      <!--        fab-->
      <!--        bottom-->
      <!--        right-->
      <!--        fixed-->
      <!--        color="secondary"-->
      <!--        :to="`/board/${$route.params.boardId}/create-event`"-->
      <!--      >-->
      <!--        <v-icon>mdi-plus</v-icon>-->
      <!--      </v-btn>-->

      <v-menu
        v-if="$vuetify.breakpoint.smAndDown && userIsMember"
        offset-y
        top
        :nudge-top="8"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-model="fabOpen"
            fab
            color="secondary"
            bottom
            right
            fixed
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <event-type-select-menu-list />
      </v-menu>
    </template>
    <v-dialog
      :value="$route.name === 'BoardCreateEvent' && userIsMember === false"
      persistent
      no-click-animation
      max-width="550px"
      @click:outside="closeCreatorDialog()"
      @keydown.esc="closeCreatorDialog()"
    >
      <v-card>
        <v-card-title
          v-t="'not-a-board-member-message'"
          class="display-1 text-center pa-12 d-block"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-t="'close'"
            text
            @click="closeCreatorDialog()"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <event-create-dialog
      ref="eventCreateDialog"
      :subjects="subjects"
      :initial-date="date"
      :value="$route.name === 'BoardCreateEvent' || $route.name === 'BoardEditEvent'"
      :edit="$route.name === 'BoardEditEvent' || lastDialogState.edit"
      :loading="!eventsAndSubjectsLoaded || !boardInfoLoaded"
      :event="dialogEvent || lastDialogState.event"
      :user-is-member="userIsMember"
      @close="closeCreatorDialog()"
    />
    <v-dialog
      :value="$route.name === 'BoardEvent' && canViewBoard === true"
      scrollable
      max-width="500px"
      persistent
      no-click-animation
      @click:outside="closeEventDetailsDialog()"
      @keydown.esc="closeEventDetailsDialog()"
    >
      <event-details-dialog
        :loading="eventListLoading"
        :event="dialogEvent || lastDialogState.event"
        :user-is-member="userIsMember"
        @close="closeEventDetailsDialog()"
      />
    </v-dialog>
    <sign-in-sheet ref="signInSheet" />
  </v-container>
</template>

<script>
  import firebase from 'firebase/app';
  import _ from 'lodash';
  import moment from 'moment-timezone';
  import { Touch } from 'vuetify/lib/directives';
  import EventList from '../components/board/EventList.vue';
  import EventCreateDialog from '../components/board/EventCreateDialog.vue';
  import AppBar from '../components/AppBar.vue';
  import EventTypeSelectMenuList from '../components/board/EventTypeSelectMenuList.vue';
  import EventDetailsDialog from '../components/board/EventDetailsDialog.vue';
  import BoardMenu from '../components/board/BoardMenu.vue';
  import 'firebase/firestore';
  import SignInSheet from '../components/SignInSheet.vue';

  export default {
    name: 'Board',
    components: {
      EventList,
      EventCreateDialog,
      AppBar,
      EventTypeSelectMenuList,
      EventDetailsDialog,
      BoardMenu,
      SignInSheet,
    },
    directives: {
      Touch,
    },
    data: () => ({
      date: new Date().toISOString().split('T')[0],
      calendarDialogVisible: false,
      boardInfo: null,
      boardInfoLoaded: false,
      events: null,
      subjects: null,
      eventsAndSubjectsLoaded: false,
      lastDialogState: {
        event: null,
        edit: false,
      },
      selfMemberRequest: null,
      selfMemberRequestLoaded: false,
      joinRequests: null,
      fabOpen: false,
      boardUserData: null,
      boardUserDataLoaded: false,
    }),
    computed: {
      dateString () {
        return new Date(this.date).toLocaleDateString(this.$i18n.locale, {
          weekday: 'short',
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
        });
      },
      userIsMember () {
        if (!this.boardInfo) return null;
        if (!this.$store.state.userAuth) return false;
        return this.boardInfo.members.includes(this.$store.state.userAuth.uid);
      },
      userIsAdmin () {
        if (!this.boardInfo) return null;
        if (!this.$store.state.userAuth) return false;
        return this.boardInfo.admins.includes(this.$store.state.userAuth.uid);
      },
      userIsOwner () {
        if (!this.boardInfo) return null;
        if (!this.$store.state.userAuth) return false;
        return this.boardInfo.owner === this.$store.state.userAuth.uid;
      },
      canViewBoard () {
        if (!this.boardInfo) return null;
        if (this.userIsMember) return true;
        return this.boardInfo.public;
      },
      dialogEvent () {
        if (!this.events) return null;
        if (!['BoardEvent', 'BoardEditEvent'].includes(this.$route.name)) return null;
        const event = this.events.find((el) => el.id === this.$route.params.eventId);
        if (!event) return null;
        return {
          ...event,
          id: event.id,
          done: this.doneHomework && event.type === 'homework' ? this.doneHomework.includes(event.id) : null,
        };
      },
      eventListLoading () {
        return !this.eventsAndSubjectsLoaded || (this.userIsMember && !this.boardUserDataLoaded);
      },
      doneHomework () {
        if (!this.userIsMember || !this.boardUserDataLoaded) return null;
        return this.boardUserData ? this.boardUserData.doneHomework || [] : [];
      },
      currentEvents () {
        if (!this.eventsAndSubjectsLoaded || !this.events) return null;

        const visibleEvents = this.events.filter((event) => event.date === this.date && !event.archived);

        return _.orderBy(visibleEvents, [(event) => {
          if (!event.time) return 10000;
          const [hourOfDay, minuteOfHour] = event.time.split(':').map((string) => parseInt(string, 10));

          return hourOfDay * 60 + minuteOfHour;
        }], ['asc']);
      },
      bindSelfMemberRequest () {
        return this.userIsMember === false && this.$store.state.userAuth !== null;
      },
      routeTitle () {
        if (this.$route.name === 'BoardCreateEvent') {
          return this.$t('routes.board-create-event');
        }
        if (this.$route.name === 'BoardEvent' && this.dialogEvent && this.boardInfo) {
          return this.$t('routes.board-view-event', {
            event: this.dialogEvent.title,
            board: this.boardInfo.name,
          });
        }
        if (this.$route.name === 'BoardEditEvent' && this.dialogEvent && this.boardInfo) {
          return this.$t('routes.board-edit-event', {
            event: this.dialogEvent.title,
            board: this.boardInfo.name,
          });
        }
        if (this.boardInfo) return this.$t('routes.board-name', { board: this.boardInfo.name });
        return this.$t('routes.board');
      },
    },
    watch: {
      '$route.params.boardId': {
        async handler (value) {
          this.boardInfoLoaded = false;
          try {
            await this.$bind('boardInfo', this.$database.collection('boards-info').doc(value));
          } catch (error) {
            console.error(error);
            this.$toast.error(this.$t('toasts.unexpected-error'));
          }
          this.boardInfoLoaded = true;
        },
        immediate: true,
      },
      canViewBoard: {
        async handler (value) {
          if (value) {
            this.eventsAndSubjectsLoaded = false;
            try {
              const boardReference = this.$database
                .collection('boards').doc(this.$route.params.boardId);
              await Promise.all([
                this.$bind('events', boardReference.collection('events')),
                this.$bind('subjects', boardReference.collection('subjects')),
              ]);
            } catch (error) {
              console.error(error);
              this.$toast.error(this.$t('toasts.unexpected-error'));
            }
            this.eventsAndSubjectsLoaded = true;
          } else {
            this.eventsAndSubjectsLoaded = false;
            if (this.$firestoreRefs.events) {
              this.$unbind('events');
            }
            if (this.$firestoreRefs.subjects) {
              this.$unbind('subjects');
            }
          }
        },
        immediate: true,
      },
      bindSelfMemberRequest: {
        async handler (value) {
          if (value) {
            this.selfMemberRequestLoaded = false;
            await this.$bind('selfMemberRequest', this.$database
              .collection('boards-info').doc(this.$route.params.boardId)
              .collection('join-requests').doc(this.$store.state.userAuth.uid));
            this.selfMemberRequestLoaded = true;
          } else {
            this.selfMemberRequestLoaded = false;
            if (this.$firestoreRefs.selfMemberRequest) {
              this.$unbind('selfMemberRequest');
            }
          }
        },
        immediate: true,
      },
      userIsAdmin: {
        async handler (value) {
          if (value) {
            try {
              const joinRequestsReference = this.$database
                .collection('boards-info').doc(this.$route.params.boardId)
                .collection('join-requests');
              await this.$bind('joinRequests', joinRequestsReference);
            } catch (error) {
              console.error(error);
              this.$toast.error(this.$t('toasts.unexpected-error'));
            }
          } else if (this.$firestoreRefs.joinRequests) {
            this.$unbind('joinRequests');
          }
        },
        immediate: true,
      },
      userIsMember: {
        async handler (value) {
          if (value) {
            this.boardUserDataLoaded = false;
            try {
              const boardUserDataReference = this.$database
                .collection('boards').doc(this.$route.params.boardId)
                .collection('user-data').doc(this.$store.state.userAuth.uid);
              await this.$bind('boardUserData', boardUserDataReference);
              this.boardUserDataLoaded = true;
            } catch (error) {
              console.error(error);
              this.$toast.error(this.$t('toasts.unexpected-error'));
            }
          } else if (this.$firestoreRefs.boardUserData) {
            this.$unbind('boardUserData');
            this.boardUserDataLoaded = false;
          }
        },
        immediate: true,
      },
      routeTitle: {
        handler (value) {
          document.title = value;
        },
        immediate: true,
      },
    },
    methods: {
      dateNext () {
        [this.date] = moment(this.date)
          .endOf('day')
          .add(1, 'days')
          .toISOString()
          .split('T');
      },
      datePrevious () {
        [this.date] = moment(this.date)
          .endOf('day')
          .subtract(1, 'days')
          .toISOString()
          .split('T');
      },
      closeCreatorDialog () {
        if (this.$route.name === 'BoardEditEvent') {
          this.lastDialogState.edit = true;
          this.lastDialogState.event = this.dialogEvent;

          setTimeout(() => {
            this.lastDialogState.edit = false;
            this.lastDialogState.event = null;
          }, 750);
        }
        this.$router.push(`/board/${this.$route.params.boardId}`);
      },
      closeEventDetailsDialog () {
        this.lastDialogState.event = this.dialogEvent;

        this.$router.push(`/board/${this.$route.params.boardId}`);

        setTimeout(() => {
          this.lastDialogState.event = null;
        }, 750);
      },
      calendarEventColor (date) {
        if (!this.eventsAndSubjectsLoaded || !this.events) return [];
        const dateEvents = this.events.filter((event) => event.date === date && !event.archived);
        const colors = [];

        const homeworkEvents = dateEvents.filter((event) => event.type === 'homework');
        if (homeworkEvents.length > 0) {
          if ((!this.boardUserDataLoaded && this.userIsMember) || !this.userIsMember) colors.push('homework');
          else if (homeworkEvents.findIndex((event) => !this.doneHomework.includes(event.id)) === -1) colors.push('homework-done');
          else colors.push('homework');
        }
        if (dateEvents.findIndex((event) => event.type === 'lesson') !== -1) colors.push('lesson');
        if (dateEvents.findIndex((event) => event.type === 'test') !== -1) colors.push('test');
        return colors;
      },
      showSignInSheet () {
        this.$refs.signInSheet.show();
      },
      async requestPermission () {
        try {
          const joinRequestReference = this.$database
            .collection('boards-info').doc(this.$route.params.boardId)
            .collection('join-requests').doc(this.$store.state.userAuth.uid);
          await joinRequestReference.set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error) {
          this.$toast.error(this.$t('toasts.unexpected-error'));
          console.error(error);
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .board-container {
    max-width: 1100px;

    .fill-width {
      width: 100%;
    }

    .min-fill-height, &.min-fill-height {
      min-height: 100%;
    }
  }
</style>
