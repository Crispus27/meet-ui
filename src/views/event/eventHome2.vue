<template>
  <!-- Need to add height inherit because Vue 2 don't support multiple root ele -->
  <div style="height: inherit"></div>
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
    const state = reactive({
      tasks: []
    });

    onMounted(() => fetchTasks());

    // UnRegister on leave
    onUnmounted(() => {
      if (store.hasModule(TODO_APP_STORE_MODULE_NAME))
        store.unregisterModule(TODO_APP_STORE_MODULE_NAME);
    });

    const fetchTasks = () => {
      console.log("rrrrrrrrrrrr");
      state.tasks = {
        tasks: [
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
        ]
      };
    };

    return {
      state
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
