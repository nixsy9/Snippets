package fileStuff;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;
import java.nio.channels.ReadableByteChannel;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

public class FileUtils {

	public static void copyFolder(File sourceFolder, File destinationFolder)
			throws IOException {
		copyFolder(sourceFolder, destinationFolder, true);
	}

	/**
	 * @param sourceFolder
	 *            - the folder to be moved
	 * @param destinationFolder
	 *            - where to move to
	 * @throws IOException
	 */
	public static void copyFolder(File sourceFolder, File destinationFolder,
			boolean overwrite) throws IOException {
		if (sourceFolder.isDirectory()) {
			if (!destinationFolder.exists()) {
				destinationFolder.mkdir();
			}
			String files[] = sourceFolder.list();
			for (String file : files) {
				File srcFile = new File(sourceFolder, file);
				File destFile = new File(destinationFolder, file);
				copyFolder(srcFile, destFile, overwrite);
			}
		} else {
			System.out.println(destinationFolder.getPath());
			if (overwrite || (!overwrite && !destinationFolder.exists())) {
				copyFile(sourceFolder, destinationFolder);
			}
		}
	}

	/**
	 * @param sourceFile
	 *            - the file to be moved
	 * @param destinationFile
	 *            - where to move to
	 * @throws IOException
	 */
	public static void copyFile(File sourceFile, File destinationFile)
			throws IOException {
		if (sourceFile.exists()) {
			if (!destinationFile.exists()) {
				destinationFile.createNewFile();
			}
			FileChannel sourceStream = null, destinationStream = null;
			try {
				sourceStream = new FileInputStream(sourceFile).getChannel();
				destinationStream = new FileOutputStream(destinationFile)
						.getChannel();
				destinationStream.transferFrom(sourceStream, 0,
						sourceStream.size());
			} finally {
				if (sourceStream != null) {
					sourceStream.close();
				}
				if (destinationStream != null) {
					destinationStream.close();
				}
			}
		}
	}

	/**
	 * @param resource
	 *            - the resource to delete
	 * @return - the deleted resource
	 * @throws IOException
	 */
	public static boolean delete(File resource) throws IOException {
		if (resource.isDirectory()) {
			File[] childFiles = resource.listFiles();
			for (File child : childFiles) {
				delete(child);
			}
		}
		return resource.delete();
	}

	/**
	 * extracts zip to the location of the zip
	 * 
	 * @param zipLocation
	 *            - the location
	 */
	public static void extractZip(String zipLocation) {
		try {
			byte[] buf = new byte[1024];
			ZipInputStream zipinputstream;
			ZipEntry zipentry;
			zipinputstream = new ZipInputStream(
					new FileInputStream(zipLocation));

			zipentry = zipinputstream.getNextEntry();
			while (zipentry != null) {
				String entryName = zipentry.getName();
				int n;
				FileOutputStream fileoutputstream;
				File newFile = new File(entryName);
				String directory = newFile.getParent();

				if (directory == null) {
					if (newFile.isDirectory()) {
						break;
					}
				}

				fileoutputstream = new FileOutputStream(zipLocation);

				while ((n = zipinputstream.read(buf, 0, 1024)) > -1) {
					fileoutputstream.write(buf, 0, n);
				}

				fileoutputstream.close();
				zipinputstream.closeEntry();
				zipentry = zipinputstream.getNextEntry();
			}
			zipinputstream.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Extracts given zip to given location
	 * 
	 * @param zipLocation
	 *            - the location of the zip to be extracted
	 * @param outputLocation
	 *            - location to extract to
	 */
	public static void extractZipTo(String zipLocation, String outputLocation) {
		try {
			System.out.println("Entracting");
			File fSourceZip = new File(zipLocation);
			File temp = new File(outputLocation);
			temp.mkdir();
			ZipFile zipFile = new ZipFile(fSourceZip);
			Enumeration<?> e = zipFile.entries();
			while (e.hasMoreElements()) {
				ZipEntry entry = (ZipEntry) e.nextElement();
				File destinationFilePath = new File(outputLocation,
						entry.getName());
				destinationFilePath.getParentFile().mkdirs();
				if (!entry.isDirectory()
						&& !entry.getName().equals(".minecraft")) {
					BufferedInputStream bis = new BufferedInputStream(
							zipFile.getInputStream(entry));
					int b;
					byte buffer[] = new byte[1024];
					FileOutputStream fos = new FileOutputStream(
							destinationFilePath);
					BufferedOutputStream bos = new BufferedOutputStream(fos,
							1024);
					while ((b = bis.read(buffer, 0, 1024)) != -1) {
						bos.write(buffer, 0, b);
					}
					bos.flush();
					bos.close();
					bis.close();
					fos.close();
				}
			}
			zipFile.close();
		} catch (IOException ioe) {
			ioe.printStackTrace();
		}
	}

	/**
	 * deletes the META-INF
	 */
	/**
	public static void killMetaInf() {
		File inputFile = new File(Settings.getSettings().getInstallPath() + "/"
				+ ModPack.getPack(LaunchFrame.getSelectedModIndex()).getDir()
				+ "/minecraft/bin", "minecraft.jar");
		File outputTmpFile = new File(Settings.getSettings().getInstallPath()
				+ "/"
				+ ModPack.getPack(LaunchFrame.getSelectedModIndex()).getDir()
				+ "/minecraft/bin", "minecraft.jar.tmp");
		try {
			JarInputStream input = new JarInputStream(new FileInputStream(
					inputFile));
			JarOutputStream output = new JarOutputStream(new FileOutputStream(
					outputTmpFile));
			JarEntry entry;

			while ((entry = input.getNextJarEntry()) != null) {
				if (entry.getName().contains("META-INF")) {
					continue;
				}
				output.putNextEntry(entry);
				byte buffer[] = new byte[1024];
				int amo;
				while ((amo = input.read(buffer, 0, 1024)) != -1) {
					output.write(buffer, 0, amo);
				}
				output.closeEntry();
			}

			input.close();
			output.close();

			if (!inputFile.delete()) {
				return;
			}
			outputTmpFile.renameTo(inputFile);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
*/



	/**
	 * Downloads data from the given URL and saves it to the given file
	 * 
	 * @param url
	 *            The url to download from
	 * @param file
	 *            The file to save to.
	 */
	public static void downloadToFile(URL url, File file) throws IOException {
		ReadableByteChannel rbc = Channels.newChannel(url.openStream());
		FileOutputStream fos = new FileOutputStream(file);
		fos.getChannel().transferFrom(rbc, 0, 1 << 24);
		fos.close();
	}

	/**
	 * Downloads data from the given URL and saves it to the given file
	 * 
	 * @param url
	 *            The url to download from
	 * @param file
	 *            The file to save to.
	 */
	public static void downloadToFile(URL url, String file) throws IOException {
		downloadToFile(url, new File(file));
	}

	public static List<String> readLines(String path) {
		return readLines(new File(path));
	}

	public static List<String> readLines(File file) {
		ArrayList<String> result = new ArrayList<String>();

		if (file.canRead()) {
			try {
				String line;
				@SuppressWarnings("resource")
				BufferedReader in = new BufferedReader(new InputStreamReader(
						new FileInputStream(file), "UTF-8"));
				while ((line = in.readLine()) != null) {
					result.add(line);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		return result;
	}
}
