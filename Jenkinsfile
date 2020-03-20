@Library('sofie-jenkins-lib') _

pipeline {
  agent any
  tools {
    nodejs "node12"
  }
  stages {
    stage('Build') {
      steps {
        sofieSlackSendBuildStarted()
        dockerBuild('sofie/tv-automation-quantel-browser-plugin')
      }
    }
    stage('Deploy') {
      when {		
        branch 'stage'		
      }
      steps {
        parallel(
          test01: {
            coreDeploy('malxsofietest01')
          },
          test02: {
            coreDeploy('malxsofietest02')
          }
        )
      }
    }
  }
  post {
    failure {
      sofieSlackSendBuildFailure()
    }
    success {
      sofieSlackSendBuildSuccess()
    }
  }
}
