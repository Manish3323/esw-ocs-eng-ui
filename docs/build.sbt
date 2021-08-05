import org.tmt.sbt.docs.Settings
import org.tmt.sbt.docs.DocKeys._

ThisBuild / scalaVersion := "2.13.6"
ThisBuild / organization := "com.github.tmtmsoftware.esw-ocs-eng-ui"
ThisBuild / organizationName := "TMT Org"

ThisBuild / docsRepo := "https://github.com/tmtsoftware/tmtsoftware.github.io.git"
ThisBuild / docsParentDir := "esw-ocs-eng-ui"
ThisBuild / gitCurrentRepo := "https://github.com/tmtsoftware/esw-ocs-eng-ui"

ThisBuild / version := {
  sys.props.get("prod.publish") match {
    case Some("true") => version.value
    case _            => "0.1.0-SNAPSHOT"
  }
}

lazy val openSite =
  Def.setting {
    Command.command("openSite") { (state) =>
      val uri = s"file://${Project.extract(state).get(siteDirectory)}/${docsParentDir.value}/${version.value}/index.html"
      state.log.info(s"Opening browser at $uri ...")
      java.awt.Desktop.getDesktop.browse(new java.net.URI(uri))
      state
    }
  }

lazy val docs = project
  .in(file("."))
  .enablePlugins(GithubPublishPlugin, ParadoxMaterialSitePlugin)
  .settings(
    commands += openSite.value,
    Settings.makeSiteMappings()
  )
