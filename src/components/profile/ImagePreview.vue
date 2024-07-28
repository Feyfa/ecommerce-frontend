<template>
  <div class="relative">

    <!-- zoom img -->
    <div 
      v-if="isZoomUserImage"
      class="z-[999] fixed top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,.7)] flex justify-center items-center cursor-zoom-out"
      @click="zoomUserImage('out')">
      <img 
        :src="src" 
        :alt="alt"
        width="500"
        class="border border-neutral-400 rounded-md shadow-xl cursor-default"
        @click.stop/>  
    </div>
    <!-- zoom img -->

    <div role="status" class="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-[rgba(0,0,0,.5)] rounded" v-if="isProcessImageUser">
        <svg aria-hidden="true" class="w-[1.5rem] h-[1.5rem] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <span class="sr-only">Loading...</span>
    </div>

    <img 
      :src="src" 
      :alt="alt" 
      class="person w-32 h-3w-32 border border-neutral-500 rounded shadow-md cursor-pointer"
      @click="togglePreview"
      @click.stop>

    <ul 
      class="absolute bg-white z-50 top-24 left-24 rounded transition-all duration-75 ease-in-out overflow-hidden"
      :class="this.$global.isCLickDropdown.profile ? 'border border-neutral-500 h-[6.25rem] shadow-lg p-2' : 'h-0'">
      <li>
        <span 
          class="inline-block px-1 rounded h-7 w-36 leading-7 hover:bg-violet-500 cursor-pointer"
          @click="zoomUserImage('in')">
          Zoom Image
        </span>
      </li>
      <li>
        <div>
          <input
            class="top-0 left-0 right-0 bottom-0 hidden"
            type="file"
            id="image-file"
            ref="imageFile"
            name="file"
            @change="imageFileChange"/>
          <span 
            class="inline-block px-1 rounded h-7 w-36 leading-7 hover:bg-violet-500 cursor-pointer"
            @click="this.$refs.imageFile.click()">
            Upload Image
          </span>
        </div>
      </li>
      <li>
        <span 
          class="inline-block px-1 rounded h-7 w-36 leading-7"
          :class="disable.deleteImage ? 'cursor-no-drop bg-[rgba(0,0,0,.1)]' : 'hover:bg-violet-500 cursor-pointer'"
          @click="deleteImage">
          Delete Image
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import { ElNotification } from 'element-plus';
import PersonImage from "@/assets/img/person.png";
import Swal from 'sweetalert2';
import { mapGetters } from 'vuex';

export default {
  name: 'ProfileImagePriview',

  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      PersonImage: PersonImage,

      isZoomUserImage: false,
      isProcessImageUser: false,

      disable: {
        deleteImage: false
      }
    }
  },

  mounted() {
    if(this.$store.getters.user.img === null) {
      this.disable.deleteImage = true;
    }
  },

  methods: {
    togglePreview() {
      this.$global.isCLickDropdown.profile = !this.$global.isCLickDropdown.profile; 
    },

    zoomUserImage(type) {
      this.isZoomUserImage = (type == 'in') ? true : false;
    },

    imageFileChange(event) {
      const file = event.target.files[0];
      // cek apakah file tipe nya image
      const extensionValid = file ? file.type.startsWith('image/') : false;
      // cek apakah file kurang dari 1mb
      const sizeValid = file ? file.size <= 1000000 : false;

      // jika file bukan image
      if(!extensionValid)
      {
        $('#image-file').val('');
        
        ElNotification({
          type: 'error',
          title: 'Error',
          message: `The foto field must be an image`
        })
      }
      // jika file di atas 1mb
      else if(!sizeValid)
      {
        $('#image-file').val('');
        
        ElNotification({
          type: 'error',
          title: 'Error',
          message: `The foto field must not be greater than 1024 kilobytes`
        })
      }
      else
      {
        const data = new FormData();
        data.append('id', this.$store.getters.user.id);
        data.append('file', this.$refs.imageFile.files[0]);

        this.isProcessImageUser = true;
        this.disable.deleteImage = true;
        
        this.$store.dispatch('uploadImageUser', data)
                   .then(response => {
                    console.log(response);

                    $('#image-file').val('');
                    this.isProcessImageUser = false;

                    if(response.data.status === 200) {
                      ElNotification({
                        type: 'success',
                        title: 'Success',
                        message: response.data.message
                      })
                      
                      localStorage.setItem('user', JSON.stringify(response.data.user));

                      /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                      this.$store.dispatch('fetchTokenFromLocalStorage');
                      this.$store.dispatch('fetchUserFromLocalStorage');
                      /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                      
                      this.$global.personImage = `http://ecommerce.backend.com/storage/${response.data.user.img}`;
                      this.disable.deleteImage = false;
                    }
                   })
                   .catch(error => {
                    console.error(error);

                    $('#image-file').val('');
                    this.isProcessImageUser = true;

                    const message = error.response.data.message;
            
                    message.forEach(msg => {
                      setTimeout(() => {
                        ElNotification({
                          type: 'error',
                          title: 'Error',
                          message: msg
                        })
                      }, 1);
                    })

                   })
      }
    },

    deleteImage() {
      if(this.$store.getters.user.img != null) {

        Swal.fire({
          title: "Delete Image",
          icon: "question",
          confirmButtonText: "Yes, delete it!",
          showCancelButton: true,
          confirmButtonColor: '#dc3545'
        })
        .then(result => {
          if(result.isConfirmed) {
            this.isProcessImageUser = true;

            this.$store.dispatch('deleteImage', {
              img: this.$store.getters.user.img
            })
            .then(response => {
              console.log(response);

              this.isProcessImageUser = false;

              if(response.data.status === 200) {
                ElNotification({
                  type: 'success',
                  title: 'Success',
                  message: response.data.message
                })
                
                localStorage.setItem('user', JSON.stringify(response.data.user));

                /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                this.$store.dispatch('fetchTokenFromLocalStorage');
                this.$store.dispatch('fetchUserFromLocalStorage');
                /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                
                this.$global.personImage = PersonImage;
                this.disable.deleteImage = true;
              }
            })
            .catch(error => {
              console.error(error);
            })
          }
        })
      }
    }
  }
}
</script>