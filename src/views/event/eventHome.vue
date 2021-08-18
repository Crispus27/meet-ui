<template>
  <!-- Need to add height inherit because Vue 2 don't support multiple root ele -->
  <div style="height: inherit">
    <div
      class="body-content-overlay"
      :class="{ show: mqShallShowLeftSidebar }"
      @click="mqShallShowLeftSidebar = false"
    />
    <div class="todo-app-list">
      <!-- App Searchbar Header -->
      <div class="app-fixed-search d-flex align-items-center">
        <!-- Toggler -->
        <div class="sidebar-toggle d-block d-lg-none ml-1">
          <feather-icon
            icon="MenuIcon"
            size="21"
            class="cursor-pointer"
            @click="mqShallShowLeftSidebar = true"
          />
        </div>

        <!-- Searchbar -->
        <div class="d-flex align-content-center justify-content-between w-100">
          <b-input-group class="input-group-merge">
            <b-input-group-prepend is-text>
              <feather-icon icon="SearchIcon" class="text-muted" />
            </b-input-group-prepend>
            <b-form-input
              :value="searchQuery"
              placeholder="Search task"
              @input="updateRouteQuery"
            />
          </b-input-group>
        </div>

        <!-- Dropdown -->
        <div class="dropdown">
          <b-dropdown variant="link" no-caret toggle-class="p-0 mr-1" right>
            <template #button-content>
              <feather-icon
                icon="MoreVerticalIcon"
                size="16"
                class="align-middle text-body"
              />
            </template>
            <b-dropdown-item @click="resetSortAndNavigate">
              Reset Sort
            </b-dropdown-item>
            <b-dropdown-item
              :to="{
                name: $route.name,
                query: { ...$route.query, sort: 'title-asc' }
              }"
            >
              Sort A-Z
            </b-dropdown-item>
            <b-dropdown-item
              :to="{
                name: $route.name,
                query: { ...$route.query, sort: 'title-desc' }
              }"
            >
              Sort Z-A
            </b-dropdown-item>
            <b-dropdown-item
              :to="{
                name: $route.name,
                query: { ...$route.query, sort: 'assignee' }
              }"
            >
              Sort Assignee
            </b-dropdown-item>
            <b-dropdown-item
              :to="{
                name: $route.name,
                query: { ...$route.query, sort: 'due-date' }
              }"
            >
              Sort Due Date
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>

      <!-- Todo List -->
      <vue-perfect-scrollbar
        :settings="perfectScrollbarSettings"
        class="todo-task-list-wrapper list-group scroll-area"
      >
        <draggable
          v-model="state.tasks"
          handle=".draggable-task-handle"
          tag="ul"
          class="todo-task-list media-list"
        >
          <li
            v-for="task in state.tasks"
            :key="task.id"
            class="todo-item"
            :class="{ completed: task.isCompleted }"
            @click="handleTaskClick(task)"
          >
            <feather-icon
              icon="MoreVerticalIcon"
              class="draggable-task-handle d-inline"
            />
            <div class="todo-title-wrapper">
              <div class="todo-title-area">
                <div class="title-wrapper">
                  <b-form-checkbox
                    :checked="task.isCompleted"
                    @click.native.stop
                    @change="updateTaskIsCompleted(task)"
                  />
                  <span class="todo-title">{{ task.title }}</span>
                </div>
              </div>
              <div class="todo-item-action">
                <div class="badge-wrapper mr-1">
                  <b-badge
                    v-for="tag in task.tags"
                    :key="tag"
                    pill
                    :variant="`light-${resolveTagVariant(tag)}`"
                    class="text-capitalize"
                  >
                    {{ tag }}
                  </b-badge>
                </div>
                <small class="text-nowrap text-muted mr-1">{{
                  formatDate(task.dueDate, { month: "short", day: "numeric" })
                }}</small>
                <b-avatar
                  v-if="task.assignee"
                  size="32"
                  :src="task.assignee.avatar"
                  :variant="`light-${resolveAvatarVariant(task.tags)}`"
                  :text="avatarText(task.assignee.fullName)"
                />
                <b-avatar v-else size="32" variant="light-secondary">
                  <feather-icon icon="UserIcon" size="16" />
                </b-avatar>
              </div>
            </div>
          </li>
        </draggable>
        <div class="no-results" :class="{ show: !state.tasks.length }">
          <h5>No Items Found</h5>
        </div>
      </vue-perfect-scrollbar>
    </div>

    <!-- Task Handler -->
    <todo-task-handler-sidebar
      v-model="isTaskHandlerSidebarActive"
      :task="task"
      :clear-task-data="clearTaskData"
      @remove-task="removeTask"
      @add-task="addTask"
      @update-task="updateTask"
    />

    <!-- Sidebar -->
    <portal to="content-renderer-sidebar-left">
      <todo-left-sidebar
        :task-tags="taskTags"
        :is-task-handler-sidebar-active.sync="isTaskHandlerSidebarActive"
        :class="{ show: mqShallShowLeftSidebar }"
        @close-left-sidebar="mqShallShowLeftSidebar = false"
      />
    </portal>
  </div>
</template>

<script>
import store from "@/store";
import {
  ref,
  watch,
  computed,
  onUnmounted,
  defineComponent,
  reactive,
  onMounted
} from "@vue/composition-api";
import {
  BFormInput,
  BInputGroup,
  BInputGroupPrepend,
  BDropdown,
  BDropdownItem,
  BFormCheckbox,
  BBadge,
  BAvatar
} from "bootstrap-vue";
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import draggable from "vuedraggable";
import { formatDate, avatarText } from "@core/utils/filter";
import { useRouter } from "@core/utils/utils";
import { useResponsiveAppLeftSidebarVisibility } from "@core/comp-functions/ui/app";
import TodoLeftSidebar from "./eventLeftSidebar.vue";
import todoStoreModule from "./todoStoreModule";
import TodoTaskHandlerSidebar from "./TodoTaskHandlerSidebar.vue";

export default defineComponent({
  name: "EventHome",
  props: {},
  components: {
    BFormInput,
    BInputGroup,
    BInputGroupPrepend,
    BDropdown,
    BDropdownItem,
    BFormCheckbox,
    BBadge,
    BAvatar,
    draggable,
    VuePerfectScrollbar,

    // App SFC
    TodoLeftSidebar,
    TodoTaskHandlerSidebar
  },
  setup(_, context) {
    // const TODO_APP_STORE_MODULE_NAME = "app-todo";

    // // Register module
    // if (!store.hasModule(TODO_APP_STORE_MODULE_NAME))
    //   store.registerModule(TODO_APP_STORE_MODULE_NAME, todoStoreModule);

    // const tasks = ref([]);

    const state = reactive({
      tasks: []
    });

    onMounted(() => fetchTasks());

    // UnRegister on leave
    onUnmounted(() => {
      // if (store.hasModule(TODO_APP_STORE_MODULE_NAME))
      //   store.unregisterModule(TODO_APP_STORE_MODULE_NAME);
    });

    const { route, router } = useRouter();
    const routeSortBy = computed(() => route.value.query.sort);
    const routeQuery = computed(() => route.value.query.q);
    const routeParams = computed(() => route.value.params);
    watch(routeParams, () => {
      console.log("------- routeParams change");
      fetchTasks();
    });

    const sortOptions = [
      "latest",
      "title-asc",
      "title-desc",
      "assignee",
      "due-date"
    ];
    const sortBy = ref(routeSortBy.value);
    watch(routeSortBy, val => {
      if (sortOptions.includes(val)) sortBy.value = val;
      else sortBy.value = val;
    });
    const resetSortAndNavigate = () => {
      const currentRouteQuery = JSON.parse(JSON.stringify(route.value.query));

      delete currentRouteQuery.sort;

      router
        .replace({ name: route.name, query: currentRouteQuery })
        .catch(() => {});
    };

    const blankTask = {
      id: null,
      title: "",
      dueDate: new Date(),
      description: "",
      assignee: null,
      tags: [],
      isCompleted: false,
      isDeleted: false,
      isImportant: false
    };
    const task = ref(JSON.parse(JSON.stringify(blankTask)));
    const clearTaskData = () => {
      task.value = JSON.parse(JSON.stringify(blankTask));
    };

    const addTask = val => {
      store.dispatch("app-todo/addTask", val).then(() => {
        // eslint-disable-next-line no-use-before-define
        fetchTasks();
      });
    };
    const removeTask = () => {
      store.dispatch("app-todo/removeTask", { id: task.value.id }).then(() => {
        // eslint-disable-next-line no-use-before-define
        fetchTasks();
      });
    };
    const updateTask = taskData => {
      store.dispatch("app-todo/updateTask", { task: taskData }).then(() => {
        // eslint-disable-next-line no-use-before-define
        fetchTasks();
      });
    };

    const perfectScrollbarSettings = {
      maxScrollbarLength: 150
    };

    const isTaskHandlerSidebarActive = ref(false);

    const taskTags = [
      {
        title: "Team",
        color: "primary",
        route: { name: "apps-todo-tag", params: { tag: "team" } }
      },
      {
        title: "Low",
        color: "success",
        route: { name: "apps-todo-tag", params: { tag: "low" } }
      },
      {
        title: "Medium",
        color: "warning",
        route: { name: "apps-todo-tag", params: { tag: "medium" } }
      },
      {
        title: "High",
        color: "danger",
        route: { name: "apps-todo-tag", params: { tag: "high" } }
      },
      {
        title: "Update",
        color: "info",
        route: { name: "apps-todo-tag", params: { tag: "update" } }
      }
    ];

    const resolveTagVariant = tag => {
      if (tag === "team") return "primary";
      if (tag === "low") return "success";
      if (tag === "medium") return "warning";
      if (tag === "high") return "danger";
      if (tag === "update") return "info";
      return "primary";
    };

    const resolveAvatarVariant = tags => {
      if (tags.includes("high")) return "primary";
      if (tags.includes("medium")) return "warning";
      if (tags.includes("low")) return "success";
      if (tags.includes("update")) return "danger";
      if (tags.includes("team")) return "info";
      return "primary";
    };

    // Search Query
    const searchQuery = ref(routeQuery.value);
    watch(routeQuery, val => {
      searchQuery.value = val;
    });
    // eslint-disable-next-line no-use-before-define
    watch([searchQuery, sortBy], () => fetchTasks());
    const updateRouteQuery = val => {
      const currentRouteQuery = JSON.parse(JSON.stringify(route.value.query));

      if (val) currentRouteQuery.q = val;
      else delete currentRouteQuery.q;

      router.replace({ name: route.name, query: currentRouteQuery });
    };

    const fetchTasks = () => {
      console.log("rrrrrrrrrrrr");
      state.tasks = [
        {
          id: 1,
          title:
            "Entire change break our wife wide it daughter mention member.",
          dueDate: "2020-11-25",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Jacob Ramirez",
            avatar: require("@/assets/images/avatars/12.png")
          },
          tags: ["update"],
          isCompleted: false,
          isDeleted: false,
          isImportant: false
        },
        {
          id: 2,
          title: "Citizen stand administration step agency century.",
          dueDate: "2020-12-14",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Andrew Anderson",
            avatar: ""
          },
          tags: ["team", "medium"],
          isCompleted: true,
          isDeleted: false,
          isImportant: false
        },
        {
          id: 3,
          title: "Meet Jane and ask for coffee ❤️",
          dueDate: "2020-11-25",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Benjamin Jacobs",
            avatar: ""
          },
          tags: ["high"],
          isCompleted: false,
          isDeleted: false,
          isImportant: false
        },
        {
          id: 4,
          title: "Answer the support tickets and close completed tickets. ",
          dueDate: "2020-11-20",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Curtis Schmidt",
            avatar: require("@/assets/images/avatars/9.png")
          },
          tags: ["medium"],
          isCompleted: false,
          isDeleted: false,
          isImportant: true
        },
        {
          id: 5,
          title:
            "Test functionality of apps developed by dev team for enhancements. ",
          dueDate: "2020-12-06",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Katherine Perkins",
            avatar: require("@/assets/images/avatars/9.png")
          },
          tags: ["medium"],
          isCompleted: true,
          isDeleted: false,
          isImportant: true
        },
        {
          id: 6,
          title: "Conduct a mini awareness meeting regarding health care. ",
          dueDate: "2020-12-06",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "David Murphy",
            avatar: ""
          },
          tags: ["high", "medium"],
          isCompleted: true,
          isDeleted: true,
          isImportant: false
        },
        {
          id: 7,
          title:
            "Plan new dashboard design with design team for Google app store. ",
          dueDate: "2020-12-05",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Karina Miller",
            avatar: require("@/assets/images/avatars/1.png")
          },
          tags: ["medium"],
          isCompleted: false,
          isDeleted: false,
          isImportant: true
        },
        {
          id: 8,
          title: "Pick up Nats from her school and drop at dance class😁 ",
          dueDate: "2020-12-08",
          description:
            "<p>Chocolate cake topping bonbon jujubes donut sweet wafer. Marzipan gingerbread powder brownie bear claw. Chocolate bonbon sesame snaps jelly caramels oat cake.</p>",
          assignee: {
            fullName: "Thomas Moses",
            avatar: require("@/assets/images/avatars/7.png")
          },
          tags: ["low", "medium"],
          isCompleted: false,
          isDeleted: false,
          isImportant: false
        }
      ];
    };

    const handleTaskClick = taskData => {
      task.value = taskData;
      isTaskHandlerSidebarActive.value = true;
    };

    // Single Task isCompleted update
    const updateTaskIsCompleted = taskData => {
      // eslint-disable-next-line no-param-reassign
      taskData.isCompleted = !taskData.isCompleted;
      updateTask(taskData);
    };

    const { mqShallShowLeftSidebar } = useResponsiveAppLeftSidebarVisibility();

    return {
      state,
      task,
      removeTask,
      addTask,
      updateTask,
      clearTaskData,
      taskTags,
      searchQuery,
      perfectScrollbarSettings,
      updateRouteQuery,
      resetSortAndNavigate,

      // UI
      resolveTagVariant,
      resolveAvatarVariant,
      isTaskHandlerSidebarActive,

      // Click Handler
      handleTaskClick,

      // Filters
      formatDate,
      avatarText,

      // Single Task isCompleted update
      updateTaskIsCompleted,

      // Left Sidebar Responsive
      mqShallShowLeftSidebar
    };
  }
});
</script>

<style lang="scss" scoped>
.draggable-task-handle {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  visibility: hidden;
  cursor: move;

  .todo-task-list .todo-item:hover & {
    visibility: visible;
  }
}
</style>

<style lang="scss">
@import "~@core/scss/base/pages/app-todo.scss";
</style>
