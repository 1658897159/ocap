/**
 * 基础菜单 商品管理
 */
<template>
  <div class="administration">
    <!-- 搜索筛选 -->
    <el-form :inline="true" :model="formInline" class="user-search">
      <el-form-item label="搜索：">
        <el-input
          v-model="formInline.deptName"
          size="small"
          placeholder="输入流程"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model="formInline.deptNo"
          size="small"
          placeholder="流程状态"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          size="small"
          type="primary"
          icon="el-icon-search"
          @click="search"
        >搜索</el-button>
        <el-button
          size="small"
          type="primary"
          icon="el-icon-plus"
          @click="handleEdit()"
        >添加</el-button>
      </el-form-item>
    </el-form>
    <!--列表-->
    <el-table
      v-loading="loading"
      size="small"
      :data="listData"
      highlight-current-row
      border
      element-loading-text="拼命加载中"
      style="width: 100%"
    >
      <el-table-column align="center" type="selection" width="60" />
      <el-table-column sortable prop="deptName" label="流程名称" width="300" />
      <el-table-column sortable prop="deptNo" label="流程描述" min-width="300" />
      <el-table-column sortable prop="editTime" label="创建时间" width="300">
        <template slot-scope="scope">
          <div>{{ scope.row.editTime }}</div>
        </template>
      </el-table-column>
      <el-table-column sortable prop="editUser" label="创建人" width="300" />
      <el-table-column align="center" label="操作" min-width="300">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleLook(scope.$index, scope.row)"
          >查看</el-button>
          <el-button
            size="mini"
            @click="handleDesign(scope.$index, scope.row)"
          >设计</el-button>
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteUser(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <Pagination
      :child-msg="pageparm"
      @callFather="callFather"
    />
    <!-- 编辑界面 -->
    <el-dialog
      :title="title"
      :visible.sync="editFormVisible"
      width="30%"
      @click="closeDialog"
    >
      <el-form
        ref="editForm"
        label-width="120px"
        :model="editForm"
        :rules="rules"
      >
        <el-form-item label="流程名称" prop="deptName">
          <el-input
            v-model="editForm.deptName"
            size="small"
            auto-complete="off"
            placeholder="请输入流程名称"
          />
        </el-form-item>
        <el-form-item label="流程描述" prop="deptNo">
          <el-input
            v-model="editForm.deptNo"
            size="small"
            auto-complete="off"
            placeholder="请输入流程描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeDialog">取消</el-button>
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          class="title"
          @click="submitForm('editForm')"
        >保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination.vue'
export default {
  // 注册组件
  components: {
    Pagination
  },
  data() {
    return {
      nshow: true, // switch开启
      fshow: false, // switch关闭
      loading: false, // 是显示加载
      editFormVisible: false, // 控制编辑页面显示与隐藏
      title: '添加流程',
      editForm: {
        deptId: '',
        deptName: '',
        deptNo: '',
        token: localStorage.getItem('logintoken')
      },
      // rules表单验证
      rules: {
        deptName: [
          { required: true, message: '请输入流程名称', trigger: 'blur' }
        ],
        deptNo: [{ required: true, message: '请输入流程描述', trigger: 'blur' }]
      },
      formInline: {
        page: 1,
        limit: 10,
        varLable: '',
        varName: '',
        token: localStorage.getItem('logintoken')
      },
      // 删除部门
      seletedata: {
        ids: '',
        token: localStorage.getItem('logintoken')
      },
      userparm: [], // 搜索权限
      listData: [], // 用户数据
      // 分页参数
      pageparm: {
        currentPage: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  /**
   * 数据发生改变
   */

  /**
   * 创建完毕
   */
  created() {
    this.getdata(this.formInline)
  },

  /**
   * 里面的方法只有被调用才会执行
   */
  methods: {
    // 获取公司列表
    getdata(parameter) {
      this.loading = true
      // 模拟数据开始
      const res = {
        code: 0,
        msg: null,
        count: 5,
        data: [
          {
            addUser: null,
            editUser: '张三',
            addTime: 1521062371000,
            editTime: 1526700200000,
            deptId: 1,
            processId: 'Id001',
            processName: '业务流程001',
            deptName: '决策流程',
            deptNo: '确认量测是否正确，是否超过Spec规格或管制界限流程',
            parentId: 1
          },
          {
            addUser: null,
            editUser: '八戒',
            addTime: 1657524074000,
            editTime: 1657524074000,
            deptId: 2,
            processId: 'Id002',
            processName: '业务流程002',
            deptName: '请假流程',
            deptNo: '确认量测是否正确，是否超过Spec规格或管制界限流程',
            parentId: 1
          }
        ]
      }
      this.loading = false
      this.listData = res.data
      this.pageparm.currentPage = this.formInline.page
      this.pageparm.pageSize = this.formInline.limit
      this.pageparm.total = res.count
      // 模拟数据结束

      /** *
       * 调用接口，注释上面模拟数据 取消下面注释
       */
      // deptList(parameter)
      //   .then(res => {
      //     this.loading = false
      //     if (res.success == false) {
      //       this.$message({
      //         type: 'info',
      //         message: res.msg
      //       })
      //     } else {
      //       this.listData = res.data
      //       // 分页赋值
      //       this.pageparm.currentPage = this.formInline.page
      //       this.pageparm.pageSize = this.formInline.limit
      //       this.pageparm.total = res.count
      //     }
      //   })
      //   .catch(err => {
      //     this.loading = false
      //     this.$message.error('菜单加载失败，请稍后再试！')
      //   })
    },
    // 分页插件事件
    callFather(parm) {
      this.formInline.page = parm.currentPage
      this.formInline.limit = parm.pageSize
      this.getdata(this.formInline)
    },
    // 搜索事件
    search() {
      this.getdata(this.formInline)
    },
    // 显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true
      if (row != undefined && row != 'undefined') {
        this.title = '修改流程'
        this.editForm.deptId = row.deptId
        this.editForm.deptName = row.deptName
        this.editForm.deptNo = row.deptNo
      } else {
        this.title = '添加流程'
        this.editForm.deptId = ''
        this.editForm.deptName = ''
        this.editForm.deptNo = ''
      }
    },

    // 显示查看界面
    handleLook: function(index, row) {
      this.$router.push({
        path: '/flowChart/lookDraw',
        query: {
          processId: row.processId,
          processName: row.processName
        }
      })
    },

    // 显示设计页面
    handleDesign: function(index, row) {
      this.$router.push({
        path: '/flowChart/designDraw',
        query: {
          processId: row.processId,
          processName: row.processName
        }
      })
    },

    // 编辑、增加页面保存方法
    submitForm(editData) {
      this.$refs[editData].validate(valid => {
        // if (valid) {
        //   deptSave(this.editForm)
        //     .then(res => {
        //       this.editFormVisible = false
        //       this.loading = false
        //       if (res.success) {
        //         this.getdata(this.formInline)
        //         this.$message({
        //           type: 'success',
        //           message: '公司保存成功！'
        //         })
        //       } else {
        //         this.$message({
        //           type: 'info',
        //           message: res.msg
        //         })
        //       }
        //     })
        //     .catch(err => {
        //       this.editFormVisible = false
        //       this.loading = false
        //       this.$message.error('公司保存失败，请稍后再试！')
        //     })
        // } else {
        //   return false
        // }
      })
    },
    // 删除公司
    deleteUser(index, row) {
      this.$confirm('确定要删除吗?', '信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // deptDelete(row.deptId)
          //   .then(res => {
          //     if (res.success) {
          //       this.$message({
          //         type: 'success',
          //         message: '公司已删除!'
          //       })
          //       this.getdata(this.formInline)
          //     } else {
          //       this.$message({
          //         type: 'info',
          //         message: res.msg
          //       })
          //     }
          //   })
          //   .catch((err) => {
          //     this.loading = false
          //     this.$message.error('公司删除失败，请稍后再试！')
          //   })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 关闭编辑、增加弹出框
    closeDialog() {
      this.editFormVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.administration {
  padding: 0 20px;
  .user-search {
    margin-top: 20px;
  }
  .userRole {
    width: 100%;
  }
}

</style>

